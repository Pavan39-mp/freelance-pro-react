const fs = require('fs');
let code = fs.readFileSync('src/pages/Analytics.jsx', 'utf-8');

if (!code.includes('import TimeAnalyticsTab')) {
  code = code.replace(
    "import { useFilterPipeline } from '../hooks/useFilterPipeline';",
    "import { useFilterPipeline } from '../hooks/useFilterPipeline';\nimport TimeAnalyticsTab from '../components/analytics/TimeAnalyticsTab';"
  );
}

const tabButton = `        <button
          onClick={() => setActiveTab('reports')}
          className={\`pb-3 px-4 font-bold text-body-sm transition-all focus:outline-none border-b-2 \${activeTab === 'reports' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}\`}
        >
          Reports & Export
        </button>
        <button
          onClick={() => setActiveTab('time')}
          className={\`pb-3 px-4 font-bold text-body-sm transition-all focus:outline-none border-b-2 \${activeTab === 'time' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}\`}
        >
          Time Tracking
        </button>`;

code = code.replace(
  /<button\s+onClick=\{\(\) => setActiveTab\('reports'\)\}[\s\S]*?<\/button>/,
  tabButton
);

const renderBlock = `      {activeTab === 'time' && (
        <TimeAnalyticsTab />
      )}`;

code = code.replace(
  "    </div>\n  );\n};",
  "      " + renderBlock + "\n    </div>\n  );\n};"
);

fs.writeFileSync('src/pages/Analytics.jsx', code);
