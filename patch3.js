const fs = require('fs');
let code = fs.readFileSync('src/pages/Notifications.jsx', 'utf-8');

// 1. Add hook import
code = code.replace(
  "import { useNotifications } from '../context/NotificationContext';",
  "import { useNotifications } from '../context/NotificationContext';\nimport { useFilterPipeline } from '../hooks/useFilterPipeline';"
);

// 2. State removal
code = code.replace(
  /  const \[searchQuery, setSearchQuery\] = useState\(''\);\n  const \[filter, setFilter\] = useState\('all'\); \/\/ all, unread, read\n  const \[currentPage, setCurrentPage\] = useState\(1\);\n  const \[selectedNotification, setSelectedNotification\] = useState\(null\);\n  const itemsPerPage = 10;/g,
  `  const [selectedNotification, setSelectedNotification] = useState(null);
  const itemsPerPage = 10;
  
  const pipelineConfig = useMemo(() => ({
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
    searchLogic: (n, q) => (n.title || '').toLowerCase().includes(q.toLowerCase()) || 
                           (n.content || '').toLowerCase().includes(q.toLowerCase()),
    statusLogic: (n, s) => {
      if (s === 'unread') return !n.read;
      if (s === 'read') return n.read;
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
  } = useFilterPipeline(notifications, pipelineConfig);`
);

// 3. Remove manual implementations
const r1 = /  const filteredNotifications = notifications\.filter[\s\S]*?\}\);\n\n  const totalPages = Math\.ceil\(filteredNotifications\.length \/ itemsPerPage\);\n  const startIndex = \(currentPage - 1\) \* itemsPerPage;\n  const paginatedNotifications = filteredNotifications\.slice\(startIndex, startIndex \+ itemsPerPage\);\n/g;
code = code.replace(r1, "");

fs.writeFileSync('src/pages/Notifications.jsx', code);
