const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.jsx', 'utf-8');

const injectionPoint = `          </div>
        </Card>
      </div>`;

const injectedGrid = `          </div>
        </Card>
      </div>

      {/* Time Tracking Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Tracked Today"
          value={\`\${dashboard?.timeSummary?.hoursToday || 0}h\`}
          subtitle="Hours Today"
          iconName="Clock"
          change="Hours Today"
          colorClass="text-primary"
          bgColorClass="bg-primary-container/20"
        />
        <StatCard
          title="Tracked This Week"
          value={\`\${dashboard?.timeSummary?.hoursThisWeek || 0}h\`}
          subtitle="Hours This Week"
          iconName="Calendar"
          change="Hours This Week"
          colorClass="text-secondary"
          bgColorClass="bg-secondary-container/20"
        />
        <StatCard
          title="Most Worked Project"
          value={dashboard?.timeSummary?.mostWorkedProject?.name || 'N/A'}
          subtitle={dashboard?.timeSummary?.mostWorkedClient?.name || 'No Client'}
          iconName="Target"
          change="Client"
          colorClass="text-tertiary"
          bgColorClass="bg-tertiary-container/30"
        />
      </div>`;

code = code.replace(injectionPoint, injectedGrid);

fs.writeFileSync('src/pages/Dashboard.jsx', code);
