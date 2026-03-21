import React from 'react';

const StatCard = ({ label, value, colorClass = "text-slate-800", bgClass = "bg-white", borderClass = "border-slate-200" }) => (
  <div className={`rounded-3xl border-2 p-5 transition-all hover:-translate-y-1 ${bgClass} ${borderClass}`}>
    <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 line-clamp-1">
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
      <StatCard label="Pending Assign" value={pendingCount} bgClass="bg-amber-50" borderClass="border-amber-100" />
      <StatCard label="In Transit" value={inTransitCount} colorClass="text-primary" bgClass="bg-blue-50" borderClass="border-blue-100" />
      <StatCard label="Total Deliveries" value={totalCount} bgClass="bg-indigo-50" borderClass="border-indigo-100" />
      <StatCard label="Delivery Users" value={usersCount} bgClass="bg-rose-50" borderClass="border-rose-100" />
    </div>
  );
};

export default DeliveryStats;
