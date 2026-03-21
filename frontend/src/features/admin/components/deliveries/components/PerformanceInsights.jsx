import React, { useMemo } from 'react';
import { resolveEntityId } from "../../../../../utils/helpers";

const PerformanceInsights = ({ deliveries, deliveryUsers }) => {
  const stats = useMemo(() => {
    // 1. Calculate Average Completion Time (Assigned -> Completed)
    const completedDeliveries = deliveries.filter(d => d.status === 'COMPLETED' && d.assignedAt && d.completedAt);
    
    const avgCompletionTimeMinutes = completedDeliveries.length > 0
      ? (completedDeliveries.reduce((acc, curr) => {
          const duration = (new Date(curr.completedAt) - new Date(curr.assignedAt)) / (1000 * 60);
          return acc + duration;
        }, 0) / completedDeliveries.length).toFixed(1)
      : "N/A";

    // 2. Leaderboard: Top Drivers by Completion Count
    const driverStats = deliveryUsers.map(user => {
      const uid = resolveEntityId(user);
      const userDeliveries = deliveries.filter(d => d.deliveryUserId === uid);
      const completed = userDeliveries.filter(d => d.status === 'COMPLETED').length;
      const cancelled = userDeliveries.filter(d => d.status === 'CANCELLED_BY_DELIVERY' || d.status === 'CANCELLED_BY_ADMIN' || d.status === 'CANCELLED_BY_USER').length;
      const successRate = userDeliveries.length > 0 ? ((completed / userDeliveries.length) * 100).toFixed(0) : 0;

      return {
        id: uid,
        name: user.name,
        completed,
        cancelled,
        successRate,
        points: user.loyaltyPoints || 0,
        rank: completed > 20 ? 'Elite' : completed > 10 ? 'Senior' : 'Junior'
      };
    }).sort((a, b) => b.completed - a.completed);

    return {
      avgCompletionTimeMinutes,
      topDrivers: driverStats.slice(0, 3), // Show top 3
      overallSuccessRate: deliveries.length > 0 
        ? ((deliveries.filter(d => d.status === 'COMPLETED').length / deliveries.length) * 100).toFixed(0)
        : 0
    };
  }, [deliveries, deliveryUsers]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Avg Performance Card */}
      <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 flex flex-col justify-between">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Efficiency Metrics</h4>
          <h3 className="text-lg font-black text-slate-800">Operational Speed</h3>
        </div>
        <div className="mt-8 flex items-baseline gap-2">
          <span className="text-4xl font-black text-primary">{stats.avgCompletionTimeMinutes}</span>
          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">avg min</span>
        </div>
        <div className="mt-6 pt-6 border-t-2 border-slate-50">
          <div className="flex justify-between items-center mb-2">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Success Rate</span>
             <span className="text-xs font-black text-emerald-600">{stats.overallSuccessRate}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
              style={{ width: `${stats.overallSuccessRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Driver Rankings (Leaderboard) */}
      <div className="lg:col-span-2 rounded-3xl border-2 border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Driver Performance</h4>
            <h3 className="text-lg font-black text-slate-800">Top Rated Couriers</h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.topDrivers.map((driver, index) => (
            <div key={driver.id} className="relative rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 pt-8 transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-4 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl bg-white border-2 border-slate-100 font-black text-slate-800 text-xs">
                #{index + 1}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-sm border-2 border-primary/5">
                  {driver.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h5 className="font-black text-slate-700 truncate text-sm">{driver.name}</h5>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${
                    driver.rank === 'Elite' ? 'text-amber-500' : driver.rank === 'Senior' ? 'text-blue-500' : 'text-slate-400'
                  }`}>
                    {driver.rank} Tier
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Completed</p>
                  <p className="text-xl font-black text-slate-800 mt-1">{driver.completed}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">SR {driver.successRate}%</p>
                  <p className="text-xs font-black text-slate-400 mt-1">{driver.points} pts</p>
                </div>
              </div>
            </div>
          ))}
          {stats.topDrivers.length === 0 && (
             <div className="col-span-3 py-8 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-2xl">
               Insufficient data for rankings.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceInsights;
