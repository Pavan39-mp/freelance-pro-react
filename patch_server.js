const fs = require('fs');
let code = fs.readFileSync('backend/server.js', 'utf-8');

code = code.replace(
  "import noteRoutes from './routes/noteRoutes.js';",
  "import noteRoutes from './routes/noteRoutes.js';\nimport timerRoutes from './routes/timerRoutes.js';"
);

code = code.replace(
  "app.use('/api/notes', noteRoutes);",
  "app.use('/api/notes', noteRoutes);\napp.use('/api/timer', timerRoutes);"
);

fs.writeFileSync('backend/server.js', code);
