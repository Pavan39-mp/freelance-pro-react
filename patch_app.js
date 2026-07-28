const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf-8');

code = code.replace(
  "import { SettingsProvider } from './context/SettingsContext';",
  "import { SettingsProvider } from './context/SettingsContext';\nimport { TimeTrackingProvider } from './context/TimeTrackingContext';"
);

code = code.replace(
  "<ClientProvider>",
  "<ClientProvider>\n                <TimeTrackingProvider>"
);

code = code.replace(
  "</ClientProvider>",
  "</TimeTrackingProvider>\n              </ClientProvider>"
);

fs.writeFileSync('src/App.jsx', code);
