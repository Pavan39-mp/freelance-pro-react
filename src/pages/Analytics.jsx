import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAnalytics } from '../context/AnalyticsContext';
import { useInvoices } from '../context/InvoiceContext';
import StatCard from '../components/cards/StatCard';
import Card from '../components/ui/Card';
import {
  Calendar, Download, Search, FileText, Printer, FileDown,
  Filter, AlertCircle, FileSpreadsheet, Percent, BarChart3, TrendingUp, PiggyBank,
  CreditCard, Clock, Target, FolderCheck, Users, IndianRupee
} from 'lucide-react';
import * as XLSX from 'xlsx';

const Analytics = () => {
  const {
    filterType, setFilterType,
    customStart, setCustomStart,
    customEnd, setCustomEnd,
    aggregates, chartData, pieData, isEmpty, isLoading,
    clients = [], projects = [], tasks = []
  } = useAnalytics();

  const [activeTab, setActiveTab] = useState('overview');
  const { revenueSummary, loadRevenueSummary } = useInvoices() || {};
  const [reportType, setReportType] = useState('clients'); // 'clients', 'projects', 'tasks', 'productivity'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Reset sub-filters on report type change
  useEffect(() => {
    setStatusFilter('All');
    setPriorityFilter('All');
    setSearchQuery('');
  }, [reportType]);

  // Reload revenue summary with date range whenever Revenue tab is active or filter changes
  useEffect(() => {
    if (activeTab !== 'revenue' || !loadRevenueSummary) return;
    const now = new Date();
    let startDate = new Date(now); startDate.setDate(startDate.getDate() - 29); startDate.setHours(0, 0, 0, 0);
    let endDate = new Date(now); endDate.setHours(23, 59, 59, 999);
    if (filterType === 'Today') { startDate = new Date(now); startDate.setHours(0, 0, 0, 0); }
    else if (filterType === 'Yesterday') { startDate = new Date(now); startDate.setDate(startDate.getDate() - 1); startDate.setHours(0, 0, 0, 0); endDate = new Date(startDate); endDate.setHours(23, 59, 59, 999); }
    else if (filterType === 'Last 7 Days') { startDate = new Date(now); startDate.setDate(startDate.getDate() - 6); startDate.setHours(0, 0, 0, 0); }
    else if (filterType === 'Last 90 Days') { startDate = new Date(now); startDate.setDate(startDate.getDate() - 89); startDate.setHours(0, 0, 0, 0); }
    else if (filterType === 'Last 12 Months') { startDate = new Date(now); startDate.setFullYear(startDate.getFullYear() - 1); startDate.setHours(0, 0, 0, 0); }
    else if (filterType === 'Custom Date Range') {
      if (!customStart || !customEnd) return;
      startDate = new Date(customStart + 'T00:00:00');
      endDate = new Date(customEnd + 'T23:59:59.999');
    }
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) return;
    loadRevenueSummary({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  }, [activeTab, filterType, customStart, customEnd, loadRevenueSummary]);

  const filterOptions = [
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last 30 Days',
    'Last 90 Days',
    'Last 12 Months',
    'Custom Date Range'
  ];

  // Format currency in Indian Rupees
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);

  // Helper to map original colors consistently based on status
  const getColor = (name) => {
    switch (name) {
      case 'Completed': return '#cfbcff';
      case 'In Progress': return '#e7c365';
      case 'To Do': return '#948e9c';
      case 'Overdue': return '#ffb4ab';
      default: return '#302d38';
    }
  };

  // Sub-filtering logs for report table
  const filteredClientsForReport = useMemo(() => {
    return clients.filter(c => {
      const nameMatch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const companyMatch = (c.company || '').toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = statusFilter === 'All' || c.status === statusFilter;
      return (nameMatch || companyMatch) && statusMatch;
    });
  }, [clients, searchQuery, statusFilter]);

  const filteredProjectsForReport = useMemo(() => {
    return projects.filter(p => {
      const nameMatch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const clientMatch = (p.clientName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = statusFilter === 'All' || p.status === statusFilter;
      const priorityMatch = priorityFilter === 'All' || p.priority === priorityFilter;
      return (nameMatch || clientMatch) && statusMatch && priorityMatch;
    });
  }, [projects, searchQuery, statusFilter, priorityFilter]);

  const filteredTasksForReport = useMemo(() => {
    return tasks.filter(t => {
      const titleMatch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      const projectMatch = (t.projectTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
      const clientMatch = (t.clientName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = statusFilter === 'All' || t.status === statusFilter;
      const priorityMatch = priorityFilter === 'All' || t.priority === priorityFilter;
      return (titleMatch || projectMatch || clientMatch) && statusMatch && priorityMatch;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const downloadCSV = (headers, rows, filename) => {
    const escapeCell = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const csvContent = [
      headers.map(escapeCell).join(','),
      ...rows.map(row => row.map(escapeCell).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    const filename = `FreelancePro_Report_${reportType}_${new Date().toISOString().slice(0, 10)}`;

    if (reportType === 'clients') {
      headers = ['Client Name', 'Company', 'Status', 'Industry', 'Projects', 'Billing (INR)'];
      rows = filteredClientsForReport.map(c => [
        c.name,
        c.company,
        c.status,
        c.industry,
        c.projectCount,
        `₹${c.billing.toLocaleString('en-IN')}`
      ]);
    } else if (reportType === 'projects') {
      headers = ['Project Name', 'Client', 'Status', 'Priority', 'Progress (%)', 'Due Date', 'Revenue (INR)'];
      rows = filteredProjectsForReport.map(p => [
        p.name,
        p.clientName,
        p.status,
        p.priority,
        p.progress,
        p.dueDate || 'N/A',
        `₹${p.revenue.toLocaleString('en-IN')}`
      ]);
    } else if (reportType === 'tasks') {
      headers = ['Task Title', 'Project', 'Client', 'Status', 'Priority', 'Progress (%)', 'Estimated Hours', 'Worked Hours', 'Deadline'];
      rows = filteredTasksForReport.map(t => [
        t.title,
        t.projectTitle,
        t.clientName,
        t.status,
        t.priority,
        t.progress,
        t.estimatedHours,
        t.workedHours,
        t.deadline || 'N/A'
      ]);
    } else if (reportType === 'productivity') {
      headers = ['Metric', 'Value'];
      rows = [
        ['Total Revenue', `₹${aggregates.revenue.toLocaleString('en-IN')}`],
        ['Active Clients', aggregates.activeClients],
        ['Completed Projects', aggregates.completedProjects],
        ['Active Tasks', aggregates.pendingTasks],
        ['Completion Rate', `${aggregates.completionRate}%`],
        ['Profit', `₹${aggregates.profit.toLocaleString('en-IN')}`],
        ['Expenses', `₹${aggregates.expenses.toLocaleString('en-IN')}`]
      ];
    }

    downloadCSV(headers, rows, filename);
  };

  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Summary info
    const summaryRows = [
      ['FreelancePro Analytics Executive Report'],
      ['Generated Date', new Date().toLocaleString()],
      ['Date Range Preset', filterType],
      ['Start Date', customStart || 'N/A'],
      ['End Date', customEnd || 'N/A'],
      [],
      ['Metric', 'Value'],
      ['Total Revenue', `₹${aggregates.revenue.toLocaleString('en-IN')}`],
      ['Active Clients', aggregates.activeClients],
      ['Completed Projects', aggregates.completedProjects],
      ['Active Tasks', aggregates.pendingTasks],
      ['Completion Rate', `${aggregates.completionRate}%`],
      ['Total Profit', `₹${aggregates.profit.toLocaleString('en-IN')}`],
      ['Total Expenses', `₹${aggregates.expenses.toLocaleString('en-IN')}`]
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(workbook, summaryWs, 'Summary');

    // Sheet 2: Clients list
    const clientDataMapped = filteredClientsForReport.map(c => ({
      'Client Name': c.name,
      Company: c.company,
      Status: c.status,
      Industry: c.industry,
      Projects: c.projectCount,
      'Billing (INR)': `₹${c.billing.toLocaleString('en-IN')}`
    }));
    const clientWs = XLSX.utils.json_to_sheet(clientDataMapped);
    XLSX.utils.book_append_sheet(workbook, clientWs, 'Clients');

    // Sheet 3: Projects list
    const projectDataMapped = filteredProjectsForReport.map(p => ({
      'Project Name': p.name,
      Client: p.clientName,
      Status: p.status,
      Priority: p.priority,
      'Budget (INR)': p.budget > 0 ? `₹${p.budget.toLocaleString('en-IN')}` : 'N/A',
      'Hourly Rate (INR)': p.hourlyRate > 0 ? `₹${p.hourlyRate.toLocaleString('en-IN')}` : 'N/A',
      'Progress (%)': `${p.progress}%`,
      'Start Date': p.startDate || 'N/A',
      'Due Date': p.dueDate || 'N/A',
      'Worked Hours': p.workedHours,
      'Estimated Hours': p.estimatedHours,
      'Revenue Generated (INR)': `₹${p.revenue.toLocaleString('en-IN')}`
    }));
    const projectWs = XLSX.utils.json_to_sheet(projectDataMapped);
    XLSX.utils.book_append_sheet(workbook, projectWs, 'Projects');

    // Sheet 4: Tasks list
    const taskDataMapped = filteredTasksForReport.map(t => ({
      'Task Title': t.title,
      Project: t.projectTitle,
      Client: t.clientName,
      Status: t.status,
      Priority: t.priority,
      'Progress (%)': `${t.progress}%`,
      'Estimated Hours': t.estimatedHours,
      'Worked Hours': t.workedHours,
      Deadline: t.deadline || 'N/A'
    }));
    const taskWs = XLSX.utils.json_to_sheet(taskDataMapped);
    XLSX.utils.book_append_sheet(workbook, taskWs, 'Tasks');

    XLSX.writeFile(workbook, `FreelancePro_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const chartWrapperClass = "h-[25rem] flex flex-col relative";

  return (
    <div className="space-y-6 pt-4 relative print:bg-white print:text-black">
      {/* Dynamic Printing Style Injector */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          /* Hide non-printable app layers entirely */
          #root > div > aside,
          #root > div > main > header,
          .no-print,
          button,
          select,
          input,
          .lucide {
            display: none !important;
          }
          
          /* Force white background print overrides */
          body, html, #root, .main-content {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-card-grid {
            grid-template-cols: repeat(4, 1fr) !important;
          }
          
          .print-card {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            color: #0f172a !important;
            padding: 1rem !important;
            box-shadow: none !important;
            border-radius: 8px !important;
          }

          table {
            border-collapse: collapse !important;
            width: 100% !important;
            color: black !important;
            margin-top: 1.5rem !important;
          }

          th, td {
            border: 1px solid #cbd5e1 !important;
            padding: 10px !important;
            color: black !important;
            text-align: left !important;
            font-size: 10pt !important;
          }

          th {
            background-color: #f1f5f9 !important;
            font-weight: bold !important;
          }
        }
      `}} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-2 print:text-gray-900 print:text-3xl print:font-bold">Analytics Reports</h2>
          <p className="text-on-surface-variant font-body-lg print:text-gray-600">Deep dive into your productivity and financial metrics.</p>
        </div>

        {/* Date Range Filter */}
        <div className="flex w-full md:w-auto flex-col items-stretch md:items-end gap-2 relative z-30 no-print">
          <div className="relative w-full md:w-auto">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full md:w-auto bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm font-bold text-on-surface py-2.5 pl-10 pr-10 focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer shadow-sm hover:shadow transition-all"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23948e9c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1em 1em'
              }}
            >
              {filterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {filterType === 'Custom Date Range' && (
            <div className="flex w-full max-w-full flex-col sm:w-auto sm:max-w-none sm:flex-row items-stretch sm:items-center gap-3 mt-2 bg-surface-container-high p-4 rounded-xl border border-outline-variant/20 shadow-2xl absolute top-full right-0 z-30 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col">
                <label className="text-[10px] text-on-surface-variant tracking-widest font-bold ml-1 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-surface-container/50 border border-outline-variant/30 rounded-lg text-body-sm text-on-surface py-2 px-3 focus:ring-1 focus:ring-primary focus:outline-none [color-scheme:dark]"
                />
              </div>
              <div className="text-on-surface-variant mt-6 hidden sm:block font-black">-</div>
              <div className="flex flex-col">
                <label className="text-[10px] text-on-surface-variant tracking-widest font-bold ml-1 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-surface-container/50 border border-outline-variant/30 rounded-lg text-body-sm text-on-surface py-2 px-3 focus:ring-1 focus:ring-primary focus:outline-none [color-scheme:dark]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printable Report Header metadata block */}
      <div className="hidden print:block border-b border-gray-200 pb-4 mb-4">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>
            <span>Filter Type: <strong>{filterType}</strong></span>
            {filterType === 'Custom Date Range' && (
              <span className="ml-4">Period: <strong>{customStart || 'N/A'}</strong> to <strong>{customEnd || 'N/A'}</strong></span>
            )}
          </div>
          <div>Report Generated: <strong>{new Date().toLocaleString()}</strong></div>
        </div>
      </div>

      {/* Tabs list switch selector */}
      <div className="flex border-b border-outline-variant/10 mb-6 no-print">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 font-bold text-body-sm transition-all focus:outline-none border-b-2 ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          Analytics Dashboard
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-4 font-bold text-body-sm transition-all focus:outline-none border-b-2 ${activeTab === 'reports' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          Reports & Export
        </button>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`pb-3 px-4 font-bold text-body-sm transition-all focus:outline-none border-b-2 ${activeTab === 'revenue' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          Revenue
        </button>
      </div>

      {/* Render active content block */}
      {activeTab === 'overview' ? (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-in fade-in duration-500 print-card-grid">
            <StatCard
              title="Revenue"
              value={formatCurrency(aggregates.revenue)}
              subtitle="Total Billed"
              iconName="IndianRupee"
              change="Total Billed"
              colorClass="text-primary print-card"
              bgColorClass="bg-primary/10"
            />
            <StatCard
              title="Active Clients"
              value={aggregates.activeClients}
              subtitle="Avg over period"
              iconName="Users"
              change="Avg over period"
              colorClass="text-tertiary print-card"
              bgColorClass="bg-tertiary/10"
            />
            <StatCard
              title="Completed Projects"
              value={aggregates.completedProjects}
              subtitle="Successfully Delivered"
              iconName="FolderCheck"
              change="Successfully Delivered"
              colorClass="text-secondary print-card"
              bgColorClass="bg-secondary-container/20"
            />
            <StatCard
              title="Completion Rate"
              value={`${aggregates.completionRate}%`}
              subtitle="Task efficiency"
              iconName="Target"
              change="Task efficiency"
              colorClass="text-primary print-card"
              bgColorClass="bg-primary/10"
            />
            <StatCard
              title="Total Earnings"
              value={formatCurrency(aggregates.totalEarnings)}
              subtitle="Projected Revenue"
              iconName="TrendingUp"
              change="Projected Revenue"
              colorClass="text-tertiary print-card"
              bgColorClass="bg-tertiary/10"
            />
            <StatCard
              title="Profit"
              value={formatCurrency(aggregates.profit)}
              subtitle="Net Income"
              iconName="PiggyBank"
              change="Net Income"
              colorClass="text-secondary print-card"
              bgColorClass="bg-secondary-container/20"
            />
            <StatCard
              title="Expenses"
              value={formatCurrency(aggregates.expenses)}
              subtitle="Operating Cost"
              iconName="CreditCard"
              change="Operating Cost"
              colorClass="text-error print-card"
              bgColorClass="bg-error/10"
            />
            <StatCard
              title="Active Tasks"
              value={aggregates.pendingTasks}
              subtitle="Awaiting completion"
              iconName="Clock"
              change="Awaiting completion"
              colorClass="text-outline print-card"
              bgColorClass="bg-outline/10"
            />
          </div>

          {/* Empty State or Charts */}
          {isEmpty && !isLoading ? (
            <Card className="p-[3rem] rounded-[1.875rem] text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300 min-h-[25rem]">
              <div className="w-20 h-20 bg-surface-variant/30 rounded-full flex items-center justify-center mb-6">
                <Calendar className="w-10 h-10 text-on-surface-variant/50" />
              </div>
              <h3 className="text-headline-md font-bold text-on-surface mb-2">No Analytics Available</h3>
              <p className="text-on-surface-variant font-body-lg">There is no data recorded for the selected date range. Try expanding your search or selecting a different preset.</p>
            </Card>
          ) : (
            <div className={`grid grid-cols-1 xl:grid-cols-2 gap-6 transition-opacity duration-300 print:hidden ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
              <Card className={chartWrapperClass}>
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-6">Task Completion Trend</h4>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#cfbcff" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#cfbcff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#494551" opacity={0.2} vertical={false} />
                      <XAxis dataKey="dateStr" stroke="#948e9c" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#948e9c" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#2b292f', border: '1px solid #494551', borderRadius: '8px' }}
                        formatter={(value, name) => [value, name === 'completedTasks' ? 'Completed Tasks' : name]}
                      />
                      <Area type="monotone" dataKey="completedTasks" stroke="#cfbcff" strokeWidth={2} fillOpacity={1} fill="url(#colorArea)" animationDuration={500} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className={chartWrapperClass}>
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-6">Project Activity</h4>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#494551" opacity={0.2} vertical={false} />
                      <XAxis dataKey="dateStr" stroke="#948e9c" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#948e9c" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(207, 188, 255, 0.1)' }}
                        contentStyle={{ backgroundColor: '#2b292f', border: '1px solid #494551', borderRadius: '8px' }}
                        formatter={(value, name) => [value, name === 'projects' ? 'Project Activity' : name]}
                      />
                      <Bar dataKey="projects" fill="#e7c365" radius={[4, 4, 0, 0]} animationDuration={500} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className={chartWrapperClass}>
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-6">Revenue Growth</h4>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#494551" opacity={0.2} vertical={false} />
                      <XAxis dataKey="dateStr" stroke="#948e9c" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#948e9c" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#2b292f', border: '1px solid #494551', borderRadius: '8px' }}
                        formatter={(value, name) => [formatCurrency(value), name === 'revenue' ? 'Revenue' : name]}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#cfbcff" strokeWidth={3} dot={{ r: 4, fill: '#141218', stroke: '#cfbcff', strokeWidth: 2 }} activeDot={{ r: 6 }} animationDuration={500} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className={chartWrapperClass}>
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-6">Task Distribution</h4>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        animationDuration={500}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#2b292f', border: '1px solid #494551', borderRadius: '8px' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}
        </>
      ) : (
        /* REPORTS AND EXPORT SUB-TAB */
        <div className="space-y-6">
          {/* Report type headers selector bar */}
          <div className="flex flex-wrap gap-2 mb-4 no-print">
            {['clients', 'projects', 'tasks', 'productivity'].map(type => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-2 rounded-xl text-body-sm font-bold capitalize transition-all focus:outline-none ${reportType === type
                  ? 'bg-primary text-on-primary shadow'
                  : 'bg-surface-container-high hover:bg-surface-variant text-on-surface-variant'
                  }`}
              >
                {type} Report
              </button>
            ))}
          </div>

          {/* Filtering row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-surface-container rounded-2xl border border-outline-variant/10 no-print">
            {/* Search query input */}
            {reportType !== 'productivity' && (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                <input
                  type="text"
                  placeholder={`Search ${reportType}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 pl-9 pr-4 focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            )}

            {/* Status Dropdowns */}
            {reportType === 'clients' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm font-medium text-on-surface py-2 px-3 focus:outline-none cursor-pointer"
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Lead">Lead</option>
              </select>
            )}

            {reportType === 'projects' && (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm font-medium text-on-surface py-2 px-3 focus:outline-none cursor-pointer"
                >
                  <option value="All">All statuses</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm font-medium text-on-surface py-2 px-3 focus:outline-none cursor-pointer"
                >
                  <option value="All">All priorities</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </>
            )}

            {reportType === 'tasks' && (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm font-medium text-on-surface py-2 px-3 focus:outline-none cursor-pointer"
                >
                  <option value="All">All statuses</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm font-medium text-on-surface py-2 px-3 focus:outline-none cursor-pointer"
                >
                  <option value="All">All priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </>
            )}

            {/* Action buttons columns */}
            <div className="flex gap-2 ml-auto sm:col-span-2 md:col-span-1">
              <button
                onClick={handleExportCSV}
                title="Export Filtered CSV"
                className="p-2 bg-surface-container-high hover:bg-surface-variant border border-outline-variant/20 rounded-xl text-on-surface transition-all focus:outline-none"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handleExportExcel}
                title="Export Excel Worksheet"
                className="p-2 bg-surface-container-high hover:bg-surface-variant border border-outline-variant/20 rounded-xl text-on-surface transition-all focus:outline-none"
              >
                <FileSpreadsheet className="w-5 h-5 text-success" />
              </button>
              <button
                onClick={handlePrintPDF}
                title="Print / Save PDF"
                className="p-2 bg-surface-container-high hover:bg-surface-variant border border-outline-variant/20 rounded-xl text-on-surface transition-all focus:outline-none"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* TABLE DISPLAY RENDER */}
          <div className="bg-surface-container rounded-2xl border border-outline-variant/10 overflow-hidden print:border-none print:shadow-none">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-body-sm text-on-surface-variant animate-pulse">Loading report data...</p>
              </div>
            ) : reportType === 'clients' ? (
              filteredClientsForReport.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left font-body-sm text-on-surface border-collapse">
                    <thead className="text-[10px] text-on-surface-variant tracking-widest bg-surface-container-high border-b border-outline-variant/10">
                      <tr>
                        <th className="p-4 font-bold">Client Name</th>
                        <th className="p-4 font-bold">Company</th>
                        <th className="p-4 font-bold">Industry</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold text-center">Projects</th>
                        <th className="p-4 font-bold text-right">Billing (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {filteredClientsForReport.map(c => (
                        <tr key={c._id} className="hover:bg-surface-variant/20 transition-colors">
                          <td className="p-4 font-bold">{c.name}</td>
                          <td className="p-4 text-on-surface-variant">{c.company || '—'}</td>
                          <td className="p-4 text-on-surface-variant">{c.industry || '—'}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${c.status === 'Active' ? 'bg-success/15 text-success-container/70 border border-success/10' :
                              c.status === 'Lead' ? 'bg-primary/15 text-primary/70 border border-primary/10' :
                                'bg-outline/15 text-on-surface-variant/70 border border-outline-variant/10'
                              }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">{c.projectCount}</td>
                          <td className="p-4 text-right font-mono font-bold text-success">{formatCurrency(c.billing)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 p-6">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-25 text-on-surface-variant" />
                  <p className="text-body-sm text-on-surface-variant font-medium">No clients found for the selected filters.</p>
                </div>
              )
            ) : reportType === 'projects' ? (
              filteredProjectsForReport.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left font-body-sm text-on-surface border-collapse">
                    <thead className="text-[10px] text-on-surface-variant tracking-widest bg-surface-container-high border-b border-outline-variant/10">
                      <tr>
                        <th className="p-4 font-bold">Project Name</th>
                        <th className="p-4 font-bold">Client</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold">Priority</th>
                        <th className="p-4 font-bold text-center">Progress</th>
                        <th className="p-4 font-bold">Due Date</th>
                        <th className="p-4 font-bold text-right">Revenue (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {filteredProjectsForReport.map(p => (
                        <tr key={p._id} className="hover:bg-surface-variant/20 transition-colors">
                          <td className="p-4 font-bold">{p.name}</td>
                          <td className="p-4 text-on-surface-variant">{p.clientName}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${p.status === 'Completed' ? 'bg-success/15 text-success-container/70 border border-success/10' :
                              p.status === 'In Progress' ? 'bg-tertiary/15 text-tertiary/70 border border-tertiary/10' :
                                p.status === 'On Hold' ? 'bg-error/15 text-error/70 border border-error/10' :
                                  'bg-outline/15 text-on-surface-variant/70 border border-outline-variant/10'
                              }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${p.priority === 'High' ? 'text-error' : p.priority === 'Low' ? 'text-on-surface-variant' : 'text-primary'
                              }`}>
                              {p.priority}
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold">{p.progress}%</td>
                          <td className="p-4 text-on-surface-variant">{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '—'}</td>
                          <td className="p-4 text-right font-mono font-bold text-success">{formatCurrency(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 p-6">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-25 text-on-surface-variant" />
                  <p className="text-body-sm text-on-surface-variant font-medium">No projects found for the selected filters.</p>
                </div>
              )
            ) : reportType === 'tasks' ? (
              filteredTasksForReport.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left font-body-sm text-on-surface border-collapse">
                    <thead className="text-[10px] text-on-surface-variant tracking-widest bg-surface-container-high border-b border-outline-variant/10">
                      <tr>
                        <th className="p-4 font-bold">Task Title</th>
                        <th className="p-4 font-bold">Project</th>
                        <th className="p-4 font-bold">Client</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold">Priority</th>
                        <th className="p-4 font-bold text-center">Progress</th>
                        <th className="p-4 font-bold text-center">Worked / Est Hours</th>
                        <th className="p-4 font-bold">Deadline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {filteredTasksForReport.map(t => (
                        <tr key={t._id} className="hover:bg-surface-variant/20 transition-colors">
                          <td className="p-4 font-bold">{t.title}</td>
                          <td className="p-4 text-on-surface-variant">{t.projectTitle}</td>
                          <td className="p-4 text-on-surface-variant">{t.clientName || '—'}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${t.status === 'Completed' ? 'bg-success/15 text-success-container/70 border border-success/10' :
                              t.status === 'In Progress' ? 'bg-tertiary/15 text-tertiary/70 border border-tertiary/10' :
                                'bg-outline/15 text-on-surface-variant/70 border border-outline-variant/10'
                              }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${t.priority === 'High' ? 'text-error' : t.priority === 'Low' ? 'text-on-surface-variant' : 'text-primary'
                              }`}>
                              {t.priority}
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold">{t.progress}%</td>
                          <td className="p-4 text-center">{t.workedHours}h / {t.estimatedHours}h</td>
                          <td className="p-4 text-on-surface-variant">{t.deadline ? new Date(t.deadline).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 p-6">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-25 text-on-surface-variant" />
                  <p className="text-body-sm text-on-surface-variant font-medium">No tasks found for the selected filters.</p>
                </div>
              )
            ) : (
              /* PRODUCTIVITY SUMMARY REPORT TAB */
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 print-card">
                    <h5 className="font-bold text-body-sm text-primary tracking-wider">Productivity/Activity Metrics</h5>
                    <div className="space-y-3 bg-surface rounded-xl p-4 border border-outline-variant/10">
                      <div className="flex justify-between border-b border-outline-variant/5 pb-2">
                        <span className="text-on-surface-variant">Task Completion Rate</span>
                        <span className="font-bold text-on-surface">{aggregates.completionRate}%</span>
                      </div>
                      <div className="flex justify-between border-b border-outline-variant/5 pb-2">
                        <span className="text-on-surface-variant">Completed Projects</span>
                        <span className="font-bold text-on-surface">{aggregates.completedProjects}</span>
                      </div>
                      <div className="flex justify-between border-b border-outline-variant/5 pb-2">
                        <span className="text-on-surface-variant">Active Clients</span>
                        <span className="font-bold text-on-surface">{aggregates.activeClients}</span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-on-surface-variant">Pending Tasks Awaiting completion</span>
                        <span className="font-bold text-on-surface">{aggregates.pendingTasks}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 print-card">
                    <h5 className="font-bold text-body-sm text-secondary tracking-wider font-display">Financial Execution Summary</h5>
                    <div className="space-y-3 bg-surface rounded-xl p-4 border border-outline-variant/10">
                      <div className="flex justify-between border-b border-outline-variant/5 pb-2">
                        <span className="text-on-surface-variant font-medium">Revenue Gross earnings</span>
                        <span className="font-bold text-success">{formatCurrency(aggregates.revenue)}</span>
                      </div>
                      <div className="flex justify-between border-b border-outline-variant/5 pb-2">
                        <span className="text-on-surface-variant font-medium">Calculated Expenses (15%)</span>
                        <span className="font-bold text-error">{formatCurrency(aggregates.expenses)}</span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-on-surface-variant font-medium">Operating Profit Margin</span>
                        <span className="font-bold text-success font-mono">{formatCurrency(aggregates.profit)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Revenue Summary Cards */}
          {revenueSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', val: revenueSummary.totalRevenue, color: 'text-tertiary', bg: 'bg-tertiary-container/20', icon: 'TrendingUp' },
                { label: 'Pending', val: revenueSummary.pendingPayments, color: 'text-primary', bg: 'bg-primary-container/20', icon: 'Clock' },
                { label: 'Overdue', val: revenueSummary.overdueAmount, color: 'text-error', bg: 'bg-error-container/20', icon: 'AlertCircle' },
                { label: 'Paid This Month', val: revenueSummary.paidThisMonth, color: 'text-secondary', bg: 'bg-secondary-container/20', icon: 'CheckCircle' }
              ].map(s => (
                <StatCard key={s.label} title={s.label}
                  value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(s.val || 0)}
                  subtitle="" iconName={s.icon} colorClass={s.color} bgColorClass={s.bg} change="" />
              ))}
            </div>
          )}

          {/* Monthly Revenue */}
          {revenueSummary?.monthlyRevenue?.length > 0 && (
            <Card className="p-6">
              <h3 className="font-display-sm text-on-surface mb-4">Monthly Revenue (₹)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueSummary.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#ffffff60', fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff60', fontSize: 11 }} dx={-8} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1C1B1F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} formatter={v => [new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v), 'Revenue']} />
                    <Bar dataKey="revenue" fill="#D0BCFF" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Revenue */}
            {revenueSummary?.clientRevenue?.length > 0 && (
              <Card className="p-6">
                <h3 className="font-display-sm text-on-surface mb-4">Revenue by Client</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueSummary.clientRevenue} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#ffffff60', fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#ffffff80', fontSize: 10 }} width={90} />
                      <Tooltip contentStyle={{ backgroundColor: '#1C1B1F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} formatter={v => [new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v), 'Revenue']} />
                      <Bar dataKey="revenue" fill="#CCC2DC" radius={[0, 4, 4, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Invoice Status Distribution */}
            {revenueSummary?.statusDistribution?.length > 0 && (
              <Card className="p-6">
                <h3 className="font-display-sm text-on-surface mb-4">Invoice Status Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={revenueSummary.statusDistribution.filter(d => d.count > 0)} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={3}>
                        {revenueSummary.statusDistribution.filter(d => d.count > 0).map((entry, i) => (
                          <Cell key={i} fill={['#D0BCFF', '#CCC2DC', '#6FE7B0', '#F5A623', '#E85D5D', '#90A4AE'][i % 6]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1C1B1F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                      <Legend formatter={v => <span style={{ color: '#CAC4D0', fontSize: 12 }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Project Revenue */}
            {revenueSummary?.projectRevenue?.length > 0 && (
              <Card className="p-6">
                <h3 className="font-display-sm text-on-surface mb-4">Revenue by Project</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueSummary.projectRevenue} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#ffffff60', fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff60', fontSize: 11 }} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: '#1C1B1F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} formatter={v => [new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v), 'Revenue']} />
                      <Bar dataKey="revenue" fill="#381E72" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Paid vs Outstanding */}
            {revenueSummary?.paidVsOutstanding?.length > 0 && (
              <Card className="p-6">
                <h3 className="font-display-sm text-on-surface mb-4">Paid vs Outstanding</h3>
                <div className="h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={revenueSummary.paidVsOutstanding} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} stroke="none">
                        {revenueSummary.paidVsOutstanding.map((entry, index) => (
                          <Cell key={index} fill={entry.name === 'Total Paid' ? '#00e676' : '#B3261E'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1C1B1F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} formatter={v => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Payment Method Distribution */}
            {revenueSummary?.methodDistribution?.length > 0 && (
              <Card className="p-6">
                <h3 className="font-display-sm text-on-surface mb-4">Payment Methods</h3>
                <div className="h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={revenueSummary.methodDistribution} dataKey="amount" nameKey="method" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} stroke="none">
                        {revenueSummary.methodDistribution.map((entry, index) => (
                          <Cell key={index} fill={['#D0BCFF', '#CCC2DC', '#49454F', '#00e676', '#381E72'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1C1B1F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} formatter={v => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Analytics;
