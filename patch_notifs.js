const fs = require('fs');
let code = fs.readFileSync('src/pages/Notifications.jsx', 'utf-8');

// 1. Add hook import
code = code.replace(
  "import { useNotifications } from '../context/NotificationContext';",
  "import { useNotifications } from '../context/NotificationContext';\nimport { useFilterPipeline } from '../hooks/useFilterPipeline';"
);

// 2. Erase manual states
code = code.replace(
  /  const \[filter, setFilter\] = useState\('all'\);\n  const \[searchQuery, setSearchQuery\] = useState\(''\);\n  const \[currentPage, setCurrentPage\] = useState\(1\);\n  const itemsPerPage = 10;\n/g,
  ""
);

// 3. Inject hook
const inject = `  const pipelineConfig = useMemo(() => ({
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
    searchLogic: (n, q) => (n.title || '').toLowerCase().includes(q.toLowerCase()) || 
                           (n.message || '').toLowerCase().includes(q.toLowerCase()),
    statusLogic: (n, s) => {
      if (s === 'unread') return !n.isRead;
      if (s === 'read') return n.isRead;
      return true; // 'all'
    }
  }), []);

  const {
    search: searchQuery, setSearch: setSearchQuery,
    status: filter, setStatus: setFilter,
    page: currentPage, setPage: setCurrentPage,
    paginatedData: paginatedNotifications,
    filteredData: filteredNotifications,
    totalPages
  } = useFilterPipeline(sorted, pipelineConfig);`;

code = code.replace("  const [selectedNotification, setSelectedNotification] = useState(null);", "  const [selectedNotification, setSelectedNotification] = useState(null);\n\n" + inject);

// 4. Remove manual filtering/pagination logic
code = code.replace(/  const filteredNotifications = useMemo\(\(\) => \{[\s\S]*?\}, \[sorted, searchQuery, filter\]\);\n/g, "");
code = code.replace(/  const totalPages = Math\.ceil\(filteredNotifications\.length \/ itemsPerPage\);\n  const paginatedNotifications = filteredNotifications\.slice\([\s\S]*?\);\n/g, "");

fs.writeFileSync('src/pages/Notifications.jsx', code);
