const fs = require('fs');
let code = fs.readFileSync('src/context/DashboardContext.jsx', 'utf-8');

code = code.replace(
  "import { useTasks } from './TaskContext';",
  "import { useTasks } from './TaskContext';\nimport { useTimeTracking } from './TimeTrackingContext';"
);

code = code.replace(
  "const { tasks } = useTasks();",
  "const { tasks } = useTasks();\n  const { timeSummary } = useTimeTracking() || {};"
);

code = code.replace(
  "}, [clients, projects, tasks]);",
  "}, [clients, projects, tasks, timeSummary]);"
);

code = code.replace(
  "recentTasks: tasks",
  "recentTasks: tasks,\n      timeSummary"
);

fs.writeFileSync('src/context/DashboardContext.jsx', code);
