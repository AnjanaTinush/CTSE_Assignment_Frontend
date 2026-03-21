import React from 'react';
import StatusPill from "../../../../../components/ui/StatusPill";
import { formatDate, resolveEntityId } from "../../../../../utils/helpers";

const UserDeliveriesDrawer = ({ isOpen, user, deliveries, normalizeRole, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-slate-50 border-l-2 border-slate-200 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-200 px-6 py-5 bg-white">
            <h2 className="text-xl font-black text-slate-800">Driver Profile</h2>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50/50">
            {/* Profile Info Section */}
            <div className="bg-white border-b-2 border-slate-200 p-6 mb-2">
              <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-primary/20 bg-primary/5 font-black text-primary text-2xl shadow-inner">
                    {user?.name?.substring(0, 2).toUpperCase()}
                  </div>
                  {/* Level Badge Overlay */}
                  <div className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white font-black text-[8px] ${
                    deliveries.filter(d => d.status === 'COMPLETED').length > 25 ? 'bg-amber-400 text-white' : 
                    deliveries.filter(d => d.status === 'COMPLETED').length > 10 ? 'bg-slate-400 text-white' : 'bg-orange-400 text-white'
                  }`}>
                    L{deliveries.filter(d => d.status === 'COMPLETED').length > 25 ? '3' : deliveries.filter(d => d.status === 'COMPLETED').length > 10 ? '2' : '1'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-800 truncate">{user?.name}</h3>
                    <span className={`inline-flex rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                      deliveries.filter(d => d.status === 'COMPLETED').length > 25 ? 'bg-amber-100 text-amber-600' : 
                      deliveries.filter(d => d.status === 'COMPLETED').length > 10 ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {deliveries.filter(d => d.status === 'COMPLETED').length > 25 ? 'Legendary' : deliveries.filter(d => d.status === 'COMPLETED').length > 10 ? 'Pro' : 'Junior'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Driver ID:</span>
                    <span className="text-xs font-bold text-slate-600 truncate">#{resolveEntityId(user)?.substring(0, 12)}</span>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Efficiency</p>
                      <p className="mt-0.5 text-xs font-black text-slate-700">
                        {deliveries.length > 0 ? ((deliveries.filter(d => d.status === 'COMPLETED').length / deliveries.length) * 100).toFixed(0) : 0}% SR
                      </p>
                    </div>
                    <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Completions</p>
                      <p className="mt-0.5 text-xs font-black text-primary">{deliveries.filter(d => d.status === 'COMPLETED').length}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center rounded-xl border-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      user?.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-rose-200 bg-rose-50 text-rose-600"
                    }`}>
                      {user?.isActive ? "Account Active" : "Disabled"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Joined {formatDate(user?.createdAt).split(',')[0]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery History Section */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Recent Delivery Activity</h4>
                <span className="text-[10px] font-black text-slate-500 bg-slate-200 px-2 py-0.5 rounded-lg">{deliveries.length} Records</span>
              </div>

              <div className="space-y-3">
                {deliveries.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 font-bold border-2 border-dashed border-slate-200 rounded-3xl">
                    No recent delivery records found.
                  </div>
                ) : (
                  deliveries.map((delivery) => {
                    const did = resolveEntityId(delivery);
                    return (
                      <div key={did} className="rounded-2xl border-2 border-slate-200 bg-white p-4 transition-transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-700">
                            #{String(delivery.orderId).substring(0, 8).toUpperCase()}
                          </span>
                          <StatusPill status={normalizeRole(delivery.status)} />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black">
                          <span className="text-slate-400 uppercase tracking-widest">Date Assigned</span>
                          <span className="text-slate-700 uppercase">{formatDate(delivery.assignedAt)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDeliveriesDrawer;
