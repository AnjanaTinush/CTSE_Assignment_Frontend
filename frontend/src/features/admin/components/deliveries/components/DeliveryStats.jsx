import React from 'react';

const StatCard = ({ label, value, colorClass = "text-slate-800" }) => (
  <div className="rounded-3xl border-2 border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-slate-300">
    <p className="text-xs font-black uppercase tracking-widest text-slate-500">
      {label}
    </p>
    <p className={`mt-3 text-3xl font-black ${colorClass}`}>
      {value}
    </p>
  </div>
);

const DeliveryStats = ({ pendingCount, inTransitCount, totalCount, usersCount }) => {
  return (
    <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-4 mb-6">
      <StatCard label="Pending Assign" value={pendingCount} />
      <StatCard label="In Transit" value={inTransitCount} colorClass="text-primary" />
      <StatCard label="Total Deliveries" value={totalCount} />
      <StatCard label="Delivery Users" value={usersCount} />
    </div>
  );
};

export default DeliveryStats;
