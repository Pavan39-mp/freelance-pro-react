const fs = require('fs');
let code = fs.readFileSync('src/components/ui/TaskDetailsDrawer.jsx', 'utf-8');

// 1. Add TaskTimeTrackingTab import
if (!code.includes("import TaskTimeTrackingTab")) {
  code = code.replace(
    "import UpdateProgressModal from '../forms/UpdateProgressModal';",
    "import UpdateProgressModal from '../forms/UpdateProgressModal';\nimport TaskTimeTrackingTab from './TaskTimeTrackingTab';"
  );
}

// 2. Add Clock to lucide-react imports if it somehow isn't there
// Wait, I saw Clock already in lucide-react in head -n 40
// 3. Add Time Tracking to Tabs
code = code.replace(
  "{ id: 'attachments', label: `Files (${(task.attachments || []).length})`, icon: Paperclip }",
  "{ id: 'attachments', label: `Files (${(task.attachments || []).length})`, icon: Paperclip },\n            { id: 'time', label: 'Time Tracking', icon: Clock }"
);

// 4. Inject Tab contents before History Tab
code = code.replace(
  "{/* History Tab */}",
  `{/* Time Tracking Tab */}
          {activeTab === 'time' && (
            <TaskTimeTrackingTab task={task} />
          )}

          {/* History Tab */}`
);

fs.writeFileSync('src/components/ui/TaskDetailsDrawer.jsx', code);
