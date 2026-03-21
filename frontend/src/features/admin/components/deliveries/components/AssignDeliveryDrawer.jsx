import React from 'react';
import { resolveEntityId } from "../../../../../utils/helpers";

const AssignDeliveryDrawer = ({ 
  isOpen, 
  onClose, 
  pendingOrders, 
  deliveryUsers, 
  deliveryAssignForm, 
  setDeliveryAssignForm, 
  onAssignClick, 
  actionLoading 
}) => {
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
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm transform bg-slate-50 border-l-2 border-slate-200 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b-2 border-slate-200 bg-white px-6 py-5">
            <h2 className="text-xl font-black text-slate-800">Assign Delivery</h2>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/50">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2.5 group">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-primary transition-colors">Pending Order</label>
                <div className="relative">
                  <select
                    value={deliveryAssignForm.orderId}
                    onChange={(event) => setDeliveryAssignForm((prev) => ({ ...prev, orderId: event.target.value }))}
                    className="w-full appearance-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-800 outline-none transition-all hover:border-slate-300 hover:bg-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="">Select an order</option>
                    {pendingOrders.map((order) => {
                      const oid = resolveEntityId(order);
                      return <option key={oid} value={oid}>Order #{oid.substring(0, 6).toUpperCase()} ({order.customerName || 'Customer'})</option>;
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5 text-slate-400 group-focus-within:text-primary transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 group">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-primary transition-colors">Delivery User</label>
                <div className="relative">
                  <select
                    value={deliveryAssignForm.deliveryUserId}
                    onChange={(event) => setDeliveryAssignForm((prev) => ({ ...prev, deliveryUserId: event.target.value }))}
                    className="w-full appearance-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-800 outline-none transition-all hover:border-slate-300 hover:bg-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="">Select delivery user</option>
                    {deliveryUsers.map((user) => (
                      <option key={resolveEntityId(user)} value={resolveEntityId(user)}>{user.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5 text-slate-400 group-focus-within:text-primary transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 group">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-primary transition-colors">Additional Notes</label>
                <textarea
                  value={deliveryAssignForm.notes}
                  onChange={(event) => setDeliveryAssignForm((prev) => ({ ...prev, notes: event.target.value }))}
                  rows={4}
                  placeholder="E.g., Fragile, Fast delivery..."
                  className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-800 outline-none transition-all hover:border-slate-300 hover:bg-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <div className="border-t-2 border-slate-200 bg-white p-6">
            <button
              type="button"
              onClick={onAssignClick}
              disabled={actionLoading === "create-delivery" || !deliveryAssignForm.orderId || !deliveryAssignForm.deliveryUserId}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-primary bg-primary px-6 py-4 text-sm font-black text-white transition-all hover:-translate-y-1 hover:bg-blue-700 hover:border-blue-700 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
            >
              <span>{actionLoading === "create-delivery" ? "Assigning..." : "Confirm Assignment"}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignDeliveryDrawer;
