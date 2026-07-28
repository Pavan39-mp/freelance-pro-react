import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../../context/AnalyticsContext';
import Card from '../ui/Card';

const ProductivityChart = () => {
  const {
    filterType,
    setFilterType,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    chartData
  } = useAnalytics();

  const filterOptions = [
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last 30 Days',
    'Last 90 Days',
    'Last 12 Months',
    'Custom Date Range'
  ];

  return (
    <Card className="xl:col-span-2 relative transition-all duration-300">
      <div className="flex justify-between items-start mb-8 gap-4">
        <div>
          <h4 className="font-headline-sm text-headline-sm text-on-surface">Weekly Trends</h4>
          <p className="text-on-surface-variant text-body-sm">Visualizing focus sessions vs task completion</p>
        </div>
        <div className="flex flex-col items-end gap-2 relative z-30">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-surface-container-high border border-outline-variant/20 rounded-lg text-body-sm text-on-surface py-2 px-3 pr-8 focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23948e9c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1em 1em'
            }}
          >
            {filterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          {filterType === 'Custom Date Range' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 bg-surface-container-high p-3 rounded-xl border border-outline-variant/20 shadow-lg absolute top-full right-0 z-30 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col">
                <label className="text-[10px] text-on-surface-variant uppercase tracking-widest font-label-caps ml-1 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-surface-container/50 border border-outline-variant/30 rounded-lg text-body-sm text-on-surface py-1.5 px-2 focus:ring-1 focus:ring-primary focus:outline-none [color-scheme:dark]"
                />
              </div>
              <div className="text-on-surface-variant mt-4 hidden sm:block">-</div>
              <div className="flex flex-col">
                <label className="text-[10px] text-on-surface-variant uppercase tracking-widest font-label-caps ml-1 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-surface-container/50 border border-outline-variant/30 rounded-lg text-body-sm text-on-surface py-1.5 px-2 focus:ring-1 focus:ring-primary focus:outline-none [color-scheme:dark]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {chartData && chartData.length > 0 ? (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cfbcff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#cfbcff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#494551" opacity={0.2} vertical={false} />
              <XAxis dataKey="dateStr" stroke="#948e9c" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#948e9c" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#2b292f', border: '1px solid #494551', borderRadius: '8px' }}
                itemStyle={{ color: '#cfbcff' }}
                formatter={(value, name) => {
                  if (name === 'completedTasks') return [value, 'Completed Tasks'];
                  if (name === 'workedHours') return [`${value} hrs`, 'Worked Hours'];
                  if (name === 'revenue') return [`₹${value}`, 'Revenue'];
                  if (name === 'projects') return [value, 'Activity Score'];
                  return [value, name];
                }}
              />
              <Area type="monotone" dataKey="completedTasks" stroke="#cfbcff" strokeWidth={2} fillOpacity={1} fill="url(#colorCompletion)" animationDuration={500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[300px] w-full flex items-center justify-center text-on-surface-variant font-body-sm">
          No analytics available for the selected date range.
        </div>
      )}
    </Card>
  );
};

export default ProductivityChart;
