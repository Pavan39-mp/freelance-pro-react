import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, MoreVertical, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { useProjects } from '../../context/ProjectContext';
import Card from '../ui/Card';
import { formatCurrency } from '../../services/api';

const ClientTable = ({
  viewMode,
  filterText,
  setFilterText,
  activeChip,
  setActiveChip,
  filteredClients,
  onViewClient,
  page,
  setPage,
  totalPages,
  totalCount,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}) => {
  const { clients } = useClients();
  const { projects } = useProjects();

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownCoords, setDropdownCoords] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isTrigger = event.target.closest('.dropdown-trigger');
      const isDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
      if (!isTrigger && !isDropdown) {
        setOpenDropdownId(null);
        setDropdownCoords(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Update dropdown coordinates on scroll or resize when open
  useEffect(() => {
    if (!openDropdownId) return;

    const handleScrollOrResize = () => {
      const activeTrigger = document.querySelector('.dropdown-trigger-active');
      if (activeTrigger) {
        const rect = activeTrigger.getBoundingClientRect();
        const dropdownHeight = 110;
        const dropdownWidth = 192; // 12rem = w-48
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUpward = spaceBelow < dropdownHeight;

        setDropdownCoords({
          top: openUpward ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
          left: rect.right - dropdownWidth,
          openUpward
        });
      }
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [openDropdownId]);

  const chips = ['All', 'Active', 'Pending', 'Inactive', 'High Revenue', 'Enterprise'];

  const handleAction = (e, action, client) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    setDropdownCoords(null);

    switch (action) {
      case 'view':
        if (onViewClient) onViewClient(client);
        break;
      default:
        break;
    }
  };

  const handleDropdownToggle = (e, client) => {
    e.stopPropagation();
    if (openDropdownId === client.id) {
      setOpenDropdownId(null);
      setDropdownCoords(null);
    } else {
      const button = e.target.closest('.dropdown-trigger');
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const dropdownHeight = 110;
      const dropdownWidth = 192; // 12rem = w-48
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < dropdownHeight;

      setDropdownCoords({
        top: openUpward ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
        left: rect.right - dropdownWidth,
        openUpward
      });
      setOpenDropdownId(client.id);
    }
  };

  const renderDropdown = (client) => {
    if (openDropdownId !== client.id || !dropdownCoords) return null;
    return createPortal(
      <div
        ref={dropdownRef}
        style={{
          position: 'fixed',
          top: `${dropdownCoords.top}px`,
          left: `${dropdownCoords.left}px`,
          width: '12rem',
          zIndex: 9999
        }}
        className="bg-surface-container-high border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden py-1.5 animate-in fade-in duration-200"
      >
        <button onClick={(e) => handleAction(e, 'view', client)} className="w-full text-left px-4 py-2.5 text-body-sm font-medium text-on-surface hover:bg-surface-variant/50 transition-colors">View Client</button>
      </div>,
      document.body
    );
  };

  // Grid View implementation
  if (viewMode === 'grid') {
    return (
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-300 relative">
        {filteredClients.map(client => {
          const clientProjectsCount = client.projectCount ?? 0;
          return (
            <Card key={client.id} onClick={() => onViewClient && onViewClient(client)} className="p-6 rounded-[1.5rem] flex flex-col gap-6 relative cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md bg-primary-container/20 flex items-center justify-center text-primary font-bold">
                    <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-body-md font-bold text-on-surface">{client.name}</h4>
                    <p className="font-body-sm text-on-surface-variant/70">{client.industry || 'Marketing Agency'} • {client.country || 'San Francisco'}</p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => handleDropdownToggle(e, client)}
                    className={`dropdown-trigger p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-all ${openDropdownId === client.id ? 'dropdown-trigger-active' : ''}`}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {renderDropdown(client)}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-caps text-[10px] uppercase tracking-wider border transition-all duration-300 shadow-sm
                    ${client.status === 'Active' ? 'bg-tertiary/10 text-tertiary border-tertiary/20' :
                      client.status === 'Pending' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                        client.status === 'Lead' ? 'bg-primary/10 text-primary border-primary/20' :
                          'bg-outline-variant/20 text-on-surface-variant border-outline-variant/30'}`}>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${client.status === 'Active' ? 'bg-tertiary' : client.status === 'Pending' ? 'bg-secondary' : client.status === 'Lead' ? 'bg-primary' : 'bg-outline-variant'}`}></span>
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${client.status === 'Active' ? 'bg-tertiary' : client.status === 'Pending' ? 'bg-secondary' : client.status === 'Lead' ? 'bg-primary' : 'bg-outline-variant'}`}></span>
                    </span>
                    {client.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Ongoing Projects</p>
                  <p className="font-mono-sm font-bold text-on-surface">{clientProjectsCount}</p>
                </div>
              </div>
            </Card>
          );
        })}
        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center text-on-surface-variant font-bold">
            {filterText === '' && activeChip === 'All'
              ? 'No connected clients yet. Clients will appear after accepting project requests.'
              : 'No clients match your search criteria.'}
          </div>
        )}
      </div>
    );
  }

  // Table View implementation
  return (
    <Card className="rounded-[2rem] overflow-visible shadow-2xl animate-in fade-in duration-300 p-0">

      {/* Search & Filters Toolbar */}
      <div className="flex flex-col gap-4 p-6 border-b border-outline-variant/10 print:hidden bg-surface-container-low/30">
        <div className="flex items-center gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-[18px] h-[18px]" />
            <input
              className="w-full bg-surface-container/50 border border-outline-variant/20 rounded-xl py-3 pl-11 pr-20 text-on-surface text-body-sm focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-on-surface-variant/50 shadow-inner"
              placeholder="Search clients, companies, or industries..."
              type="text"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {filterText && (
                <button onClick={() => setFilterText('')} className="p-1.5 hover:bg-surface-variant rounded-full text-on-surface-variant transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          {chips.map(chip => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`px-4 py-1.5 rounded-lg font-label-caps text-[11px] font-bold tracking-wider whitespace-nowrap transition-all duration-200 border ${activeChip === chip ? 'bg-primary text-on-primary border-primary shadow-md' : 'bg-transparent text-on-surface-variant border-transparent hover:bg-surface-variant/50 hover:text-on-surface'}`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar transition-all duration-300">
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high/30 border-b border-outline-variant/10 select-none">
              <th onClick={() => handleSort('name')} className="px-8 py-5 font-label-caps text-[11px] text-on-surface-variant tracking-widest font-bold cursor-pointer hover:text-primary transition-colors">
                Client Identity {sortBy === 'name' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
              </th>
              <th onClick={() => handleSort('status')} className="px-6 py-5 font-label-caps text-[11px] text-on-surface-variant tracking-widest font-bold cursor-pointer hover:text-primary transition-colors">
                Status {sortBy === 'status' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
              </th>
              <th className="px-6 py-5 font-label-caps text-[11px] text-on-surface-variant tracking-widest font-bold">Ongoing Projects</th>
              <th onClick={() => handleSort('createdAt')} className="px-6 py-5 font-label-caps text-[11px] text-on-surface-variant tracking-widest font-bold text-right cursor-pointer hover:text-primary transition-colors">
                Lifetime Billing {sortBy === 'createdAt' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
              </th>
              <th className="px-6 py-5 font-label-caps text-[11px] text-on-surface-variant tracking-widest font-bold">Last Activity</th>
              <th className="px-6 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {filteredClients.map((client, index) => {
              const clientProjectsCount = client.projectCount ?? 0;
              const totalClientProjects = Math.max(5, clientProjectsCount + 2); // Mock for demo
              const completionPercent = client.overallProgress || 0;

              const activityMock = ['Online Now', '5 mins ago', '2 hours ago', 'Yesterday'][index % 4];

              return (
                <tr key={client.id} onClick={() => onViewClient && onViewClient(client)} className="group hover:bg-surface-variant/30 hover:shadow-lg hover:-translate-y-[1px] hover:border-primary/20 transition-all duration-300 ease-in-out cursor-pointer relative z-10 hover:z-20">
                  <td className="px-8 py-5">
                    <div className={`flex items-center gap-4 ${client.status === 'Inactive' ? 'opacity-60 group-hover:opacity-100 transition-all' : ''}`}>
                      <div className={`h-12 w-12 rounded-xl overflow-hidden shadow-md ring-1 ring-outline-variant/10 ${client.status === 'Inactive' ? 'grayscale' : ''}`}>
                        <img src={client.avatar} alt={client.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div>
                        <p className="font-body-md font-bold text-on-surface group-hover:text-primary transition-colors">{client.name}</p>
                        <p className="font-body-sm text-on-surface-variant/70">{client.industry || 'Marketing Agency'} • {client.country || 'San Francisco'} • Client Since 2024</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-label-caps text-[10px] uppercase font-bold tracking-wider border transition-all duration-300 shadow-sm
                      ${client.status === 'Active' ? 'bg-tertiary/10 text-tertiary border-tertiary/20' :
                        client.status === 'Pending' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                          client.status === 'Lead' ? 'bg-primary/10 text-primary border-primary/20' :
                            'bg-outline-variant/20 text-on-surface-variant border-outline-variant/30'}`}>
                      <span className="relative flex h-1.5 w-1.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${client.status === 'Active' ? 'bg-tertiary' : client.status === 'Pending' ? 'bg-secondary' : client.status === 'Lead' ? 'bg-primary' : 'bg-outline-variant'}`}></span>
                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${client.status === 'Active' ? 'bg-tertiary' : client.status === 'Pending' ? 'bg-secondary' : client.status === 'Lead' ? 'bg-primary' : 'bg-outline-variant'}`}></span>
                      </span>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2 w-32">
                      <div className="flex justify-between items-center text-[10px] font-label-caps font-bold uppercase tracking-wider">
                        <span className="text-on-surface">{clientProjectsCount} / {totalClientProjects} Projects</span>
                        <span className="text-on-surface-variant">{completionPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${completionPercent}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-sans">
                    <div className="flex flex-col items-end">
                      <p className="font-mono-sm text-on-surface font-black">{formatCurrency(client.lifetimeBilling || 0)}</p>
                      <p className="text-[11px] font-bold text-tertiary mt-0.5">+18% YoY</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-body-sm text-on-surface-variant/80 font-medium">{activityMock}</p>
                  </td>
                  <td className="px-6 py-5 text-right relative">
                    <button
                      onClick={(e) => handleDropdownToggle(e, client)}
                      className={`dropdown-trigger p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-all ${openDropdownId === client.id ? 'dropdown-trigger-active' : ''}`}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {renderDropdown(client)}
                  </td>
                </tr>
              );
            })}
            {filteredClients.length === 0 && filterText === '' && activeChip === 'All' && (
              <tr>
                <td colSpan="6" className="px-8 py-24 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center">
                    <div className="w-24 h-24 rounded-3xl bg-surface-variant/30 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                      <Users className="w-10 h-10 text-on-surface-variant/50 relative z-10" />
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 font-bold">No Clients Yet</h3>
                    <p className="font-body-md text-on-surface-variant mb-8 text-balance leading-relaxed">
                      No connected clients yet. Clients will appear after accepting project requests.
                    </p>
                  </div>
                </td>
              </tr>
            )}
            {filteredClients.length === 0 && (filterText !== '' || activeChip !== 'All') && (
              <tr>
                <td colSpan="6" className="px-8 py-24 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center text-on-surface-variant">
                    <p className="font-bold mb-2">No clients match your search.</p>
                    <button onClick={() => { setFilterText(''); setActiveChip('All'); }} className="text-primary hover:underline font-bold">Clear filters</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant/10 print:hidden bg-surface-container-low/30">
          <p className="text-body-sm text-on-surface-variant font-medium">
            Showing <span className="font-bold text-on-surface">{(page - 1) * 10 + 1}–{Math.min(page * 10, totalCount)}</span> of <span className="font-bold text-on-surface">{totalCount}</span> Clients
          </p>
          <div className="flex gap-1.5 items-center">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-outline-variant/20 rounded-xl text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface transition-all disabled:opacity-30 disabled:hover:bg-transparent mr-2 shadow-sm font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-body-sm font-bold text-on-surface px-3">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-outline-variant/20 rounded-xl text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface transition-all ml-2 shadow-sm font-bold"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ClientTable;
