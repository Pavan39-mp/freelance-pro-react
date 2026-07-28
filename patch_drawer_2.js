const fs = require('fs');
let code = fs.readFileSync('src/components/ui/TaskDetailsDrawer.jsx', 'utf-8');

// Import new Tab
if (!code.includes('import TaskTimeTrackingTab')) {
  code = code.replace(
    "import UpdateProgressModal from '../forms/UpdateProgressModal';",
    "import UpdateProgressModal from '../forms/UpdateProgressModal';\nimport TaskTimeTrackingTab from './TaskTimeTrackingTab';"
  );
}

// Add Tab
if (!code.includes("{ id: 'time', label: 'Time Tracking', icon: Clock }")) {
  code = code.replace(
    "{ id: 'attachments', label: `Files (${(task.attachments || []).length})`, icon: Paperclip }",
    "{ id: 'attachments', label: `Files (${(task.attachments || []).length})`, icon: Paperclip },\n            { id: 'time', label: 'Time Tracking', icon: Clock }"
  );
}

// Display Tab
const tabInjection = `          {/* Comments Tab */}
          {activeTab === 'time' && (
             <TaskTimeTrackingTab task={task} />
          )}

          {activeTab === 'comments'`;
          
if (!code.includes("<TaskTimeTrackingTab task={task} />")) {
  code = code.replace(
    "{/* Comments Tab */}\n          {activeTab === 'comments'",
    tabInjection
  );
}

fs.writeFileSync('src/components/ui/TaskDetailsDrawer.jsx', code);
