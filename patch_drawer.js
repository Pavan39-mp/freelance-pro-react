const fs = require('fs');
let code = fs.readFileSync('src/components/ui/TaskDetailsDrawer.jsx', 'utf-8');

// Import new Tab
code = code.replace(
  "import { getIcon, getIconBg } from '../../utils/activityUtils';",
  "import { getIcon, getIconBg } from '../../utils/activityUtils';\nimport TaskTimeTrackingTab from './TaskTimeTrackingTab';"
);
code = code.replace(
  "import { CloudLightning } from 'lucide-react';",
  "import { CloudLightning, Clock } from 'lucide-react';"
);

// Add Tab
code = code.replace(
  "{ id: 'attachments', label: `Files (${(task.attachments || []).length})`, icon: Paperclip }",
  "{ id: 'attachments', label: `Files (${(task.attachments || []).length})`, icon: Paperclip },\n            { id: 'time', label: 'Time Tracking', icon: Clock }"
);

// Display Tab
const tabInjection = `          {/* Comments Tab */}
          {activeTab === 'time' && (
             <TaskTimeTrackingTab task={task} />
          )}

          {activeTab === 'comments'`;

code = code.replace(
  "{/* Comments Tab */}\n          {activeTab === 'comments'",
  tabInjection
);

fs.writeFileSync('src/components/ui/TaskDetailsDrawer.jsx', code);
