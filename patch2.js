const fs = require('fs');
let code = fs.readFileSync('src/pages/Analytics.jsx', 'utf-8');

const s1 = `  const [reportType, setReportType] = useState('clients'); // 'clients', 'projects', 'tasks', 'productivity'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Reset sub-filters on report type change
  useEffect(() => {
    setStatusFilter('All');
    setPriorityFilter('All');
    setSearchQuery('');
  }, [reportType]);`;

const r1 = `  const [reportType, setReportType] = useState('clients'); // 'clients', 'projects', 'tasks', 'productivity'

  const activeData = useMemo(() => {
    if (reportType === 'clients') return clients;
    if (reportType === 'projects') return projects;
    return tasks;
  }, [reportType, clients, projects, tasks]);

  const activeConfig = useMemo(() => {
    if (reportType === 'clients') {
      return {
        searchLogic: (c, q) => (c.name || '').toLowerCase().includes(q.toLowerCase()) || 
                               (c.company || '').toLowerCase().includes(q.toLowerCase()),
        statusLogic: (c, s) => c.status === s
      };
    }
    if (reportType === 'projects') {
      return {
        searchLogic: (p, q) => (p.name || '').toLowerCase().includes(q.toLowerCase()) || 
                               (p.clientName || '').toLowerCase().includes(q.toLowerCase()),
        statusLogic: (p, s) => p.status === s,
        priorityLogic: (p, pr) => p.priority === pr
      };
    }
    return {
      searchLogic: (t, q) => (t.title || '').toLowerCase().includes(q.toLowerCase()) || 
                             (t.projectTitle || '').toLowerCase().includes(q.toLowerCase()) || 
                             (t.clientName || '').toLowerCase().includes(q.toLowerCase()),
      statusLogic: (t, s) => t.status === s,
      priorityLogic: (t, pr) => t.priority === pr
    };
  }, [reportType]);

  const {
    search: searchQuery, setSearch: setSearchQuery,
    status: statusFilter, setStatus: setStatusFilter,
    priority: priorityFilter, setPriority: setPriorityFilter,
    filteredData: filteredActiveData
  } = useFilterPipeline(activeData, activeConfig);

  // Reset sub-filters on report type change
  useEffect(() => {
    setStatusFilter('All');
    setPriorityFilter('All');
    setSearchQuery('');
  }, [reportType, setStatusFilter, setPriorityFilter, setSearchQuery]);`;

code = code.replace(s1, r1);

// Remove the 3 manual blocks:
code = code.replace(/  \/\/ Sub-filtering logs for report table[\s\S]*?\}, \[tasks, searchQuery, statusFilter, priorityFilter\]\);\n/g, `  // Sub-filtering logs for report table
  const filteredClientsForReport = reportType === 'clients' ? filteredActiveData : [];
  const filteredProjectsForReport = reportType === 'projects' ? filteredActiveData : [];
  const filteredTasksForReport = reportType === 'tasks' || reportType === 'productivity' ? filteredActiveData : [];\n`);

code = code.replace("import { useAnalytics } from '../context/AnalyticsContext';", "import { useAnalytics } from '../context/AnalyticsContext';\nimport { useFilterPipeline } from '../hooks/useFilterPipeline';");

fs.writeFileSync('src/pages/Analytics.jsx', code);
