import React from 'react';
import StatusPill from "../../../../../components/ui/StatusPill";
import { formatDate, resolveEntityId } from "../../../../../utils/helpers";
import { 
  DELIVERY_ALLOWED_STATUS_FOR_DELIVERY_ROLE, 
  DELIVERY_STATUS_OPTIONS 
} from "../../../../../utils/constants";

const DeliveryTable = ({ 
  viewMode, // 'active' (users) or 'manage' (deliveries)
  manageTab, // 'pending' or 'all'
  pendingOrders,
  deliveries = [],
  deliveryUsers = [],
  normalizeRole,
  deliveryStatusDrafts,
  setDeliveryStatusDrafts,
  handleDeliveryStatusUpdate,
  onAssignOrder,
  onViewUserDetails,
  actionLoading
}) => {
  const getTableTitle = () => {
    if (viewMode === "active") return "Delivery Users";
    return manageTab === "pending" ? "Pending Orders" : "All Deliveries";
  };

  const totalCount = viewMode === "active" 
    ? deliveryUsers.length 
    : (manageTab === "pending" ? pendingOrders.length : deliveries.length);

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-slate-200 bg-white mt-4">
      {/* Header */}
      <div className="border-b-2 border-slate-200 bg-slate-50 px-6 py-5 flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-800">{getTableTitle()}</h3>
        <span className="inline-flex items-center justify-center rounded-xl bg-slate-200 px-3 py-1 text-xs font-black text-slate-700">
          {totalCount} Total
        </span>
      </div>

      <div className="overflow-x-auto">
        {viewMode === "active" ? (
          <table className="min-w-full border-collapse text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">User ID</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Name</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Contact</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Points</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveryUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-bold">No delivery users found</td>
                </tr>
              ) : (
                deliveryUsers.map((user) => {
                  const uid = resolveEntityId(user);
                  return (
                    <tr key={uid} className="transition-colors hover:bg-slate-50/50 text-[13px]">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
                          #{uid.substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-black text-primary text-[10px]">
                            {user.name?.substring(0, 2).toUpperCase()}
                          </div>
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-bold">{user.email || user.contactNumber || 'N/A'}</td>
                      <td className="px-6 py-4 font-black text-primary">{user.loyaltyPoints ?? 0} <span className="text-[10px] text-slate-400">pts</span></td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-xl border-2 px-2.5 py-1 text-[10px] font-black uppercase tracking-tight ${
                          user.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-rose-200 bg-rose-50 text-rose-600"
                        }`}>
                          {user.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onViewUserDetails(user)}
                          className="inline-flex items-center justify-center rounded-xl bg-slate-100 p-2 text-slate-600 transition-all hover:bg-primary/10 hover:text-primary"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : manageTab === "pending" ? (
          <table className="min-w-full border-collapse text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Order ID</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Customer</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Address</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Items</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Payment</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Total</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Date</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500 font-bold">No pending orders found</td>
                </tr>
              ) : (
                pendingOrders.map((order) => {
                  const oid = resolveEntityId(order);
                  return (
                    <tr key={oid} className="transition-colors hover:bg-slate-50/50 text-[13px]">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
                          #{String(oid).substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">{order.customerName || "Customer"}</td>
                      <td className="px-6 py-4 text-slate-500 font-bold max-w-xs truncate">{order.deliveryLocation?.address || "No address"}</td>
                      <td className="px-6 py-4 font-black text-slate-600">{order.items?.length || 0} <span className="text-[10px] text-slate-400">items</span></td>
                      <td className="px-6 py-4">
                         <span className="inline-flex items-center rounded-xl bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600 uppercase tracking-tight">
                            {order.paymentMethod?.replace(/_/g, ' ') || "N/A"}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-primary font-black">{order.totalAmount ? `$${order.totalAmount}` : "N/A"}</td>
                      <td className="px-6 py-4 text-slate-400 font-bold text-[10px] uppercase">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onAssignOrder(oid)}
                          className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-100 hover:bg-slate-200 px-5 py-2.5 text-xs font-black text-slate-800 transition-transform hover:-translate-y-0.5"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full border-collapse text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Order ID</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Address</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Assigned To</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px]">Date</th>
                <th className="border-b border-slate-200 px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-bold">No deliveries found</td>
                </tr>
              ) : (
                deliveries.map((delivery) => {
                  const deliveryId = resolveEntityId(delivery);
                  const status = normalizeRole(delivery.status);
                  const isTerminal = DELIVERY_ALLOWED_STATUS_FOR_DELIVERY_ROLE.includes(status);
                  return (
                    <tr key={deliveryId} className="transition-colors hover:bg-slate-50/50 text-[13px]">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
                          #{String(delivery.orderId).substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-bold max-w-xs truncate">{delivery.deliveryLocation?.address || "N/A"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 font-black text-slate-600 text-[10px]">
                            {(delivery.deliveryUserName || delivery.deliveryUserId || '?').substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-700">{delivery.deliveryUserName || delivery.deliveryUserId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><StatusPill status={status} /></td>
                      <td className="px-6 py-4 text-slate-400 font-bold text-[10px] uppercase">{formatDate(delivery.assignedAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="relative group">
                            <select
                              value={deliveryStatusDrafts[deliveryId] || ""}
                              onChange={(event) => setDeliveryStatusDrafts((prev) => ({ ...prev, [deliveryId]: event.target.value }))}
                              className="appearance-none rounded-xl border-2 border-slate-200 bg-slate-50 pl-4 pr-10 py-2.5 text-xs font-bold text-slate-700 outline-none transition-all group-focus-within:border-primary group-focus-within:bg-white"
                            >
                              <option value="">Status...</option>
                              {DELIVERY_STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 group-focus-within:text-primary">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeliveryStatusUpdate(delivery)}
                            disabled={isTerminal || actionLoading === `delivery-status:${deliveryId}` || !deliveryStatusDrafts[deliveryId]}
                            className="inline-flex items-center justify-center rounded-xl border-2 border-primary bg-primary px-5 py-2.5 text-xs font-black text-white transition-all hover:bg-blue-700 hover:border-blue-700 hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DeliveryTable;
