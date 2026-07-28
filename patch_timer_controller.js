const fs = require('fs');
let code = fs.readFileSync('backend/controllers/timerController.js', 'utf-8');

const aggReplace = `
        const monthlyDataMap = {};

        allSessions.forEach(s => {
            const durationHours = (s.duration || 0) / 3600;
            const sTime = new Date(s.startTime);

            if (sTime >= todayStart) hoursToday += durationHours;
            if (sTime >= weekStart) hoursThisWeek += durationHours;
            if (sTime >= monthStart) hoursThisMonth += durationHours;

            // Chart data aggregations
            const dateStr = sTime.toISOString().split('T')[0];
            const monthStr = \`\${sTime.getFullYear()}-\${(sTime.getMonth()+1).toString().padStart(2,'0')}\`;
            
            dailyDataMap[dateStr] = (dailyDataMap[dateStr] || 0) + durationHours;
            monthlyDataMap[monthStr] = (monthlyDataMap[monthStr] || 0) + durationHours;

            if (s.projectId) {
                const pid = s.projectId.toString();
                projectMap[pid] = (projectMap[pid] || 0) + durationHours;
            }
        });

        // Convert maps to arrays for charts
        const dailyChartData = Object.keys(dailyDataMap).sort().map(k => ({ date: k, hours: Number(dailyDataMap[k].toFixed(2)) }));
        const monthlyChartData = Object.keys(monthlyDataMap).sort().map(k => ({ month: k, hours: Number(monthlyDataMap[k].toFixed(2)) }));
`;

code = code.replace(
  "allSessions.forEach(s => {",
  "const dailyDataMap = {};\n" + aggReplace + "\n\n        // Dummy match to replace original forEach:\n        /*"
);

code = code.replace(
  "        // Find most worked project",
  "        */\n        // Find most worked project"
);

code = code.replace(
  "projectHoursMap: projectMap",
  "projectHoursMap: projectMap,\n            dailyChartData,\n            monthlyChartData"
);

fs.writeFileSync('backend/controllers/timerController.js', code);
