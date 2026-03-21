import { resolveEntityId } from "../../../../utils/helpers";
import { useMemo, useState } from "react";

// Sub-components
import DeliveryStats from "./components/DeliveryStats";
import AssignDeliveryDrawer from "./components/AssignDeliveryDrawer";
import UserDeliveriesDrawer from "./components/UserDeliveriesDrawer";
import DeliveryTable from "./components/DeliveryTable";

const DeliveryManagement = ({
  activeDeliveryView = "manage",
  orders = [],
  deliveryAssignForm,
  setDeliveryAssignForm,
  deliveryUsers,
  handleCreateDelivery,
  actionLoading,
  deliveries,
  normalizeRole,
  deliveryStatusDrafts,
  setDeliveryStatusDrafts,
  handleDeliveryStatusUpdate,
}) => {
  const [isAssignDrawerOpen, setIsAssignDrawerOpen] = useState(false);
  const [selectedUserForDrawer, setSelectedUserForDrawer] = useState(null);
  const [manageTab, setManageTab] = useState("pending");

  const pendingOrders = useMemo(() => {
    const assignedOrderIds = new Set(deliveries.map((d) => String(d.orderId)));
    return orders.filter((o) => {
      const oid = String(resolveEntityId(o));
      const status = normalizeRole(o.status);
      return !assignedOrderIds.has(oid) && ["PENDING", "CONFIRMED"].includes(status);
    });
  }, [orders, deliveries, normalizeRole]);

  const inTransitCount = useMemo(() => {
    return deliveries.filter((d) => {
      const status = normalizeRole(d.status);
      return ["ASSIGNED", "OUT_FOR_DELIVERY", "PICKED_UP"].includes(status);
    }).length;
  }, [deliveries, normalizeRole]);

  const onAssignClick = async () => {
    await handleCreateDelivery();
    if (deliveryAssignForm.orderId && deliveryAssignForm.deliveryUserId) {
      setIsAssignDrawerOpen(false);
    }
  };

  const userRecentDeliveries = useMemo(() => {
    if (!selectedUserForDrawer) return [];
    return deliveries.filter((d) => {
      const id1 = String(d.deliveryUserId);
      const id2 = String(resolveEntityId(selectedUserForDrawer));
      return id1 === id2;
    });
  }, [deliveries, selectedUserForDrawer]);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      {activeDeliveryView === "manage" && (
        <>
          <DeliveryStats 
            pendingCount={pendingOrders.length}
            inTransitCount={inTransitCount}
            totalCount={deliveries.length}
            usersCount={deliveryUsers.length}
          />
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex space-x-2 w-full sm:w-auto p-1 bg-slate-100 rounded-2xl border-2 border-slate-100">
              <button
                onClick={() => setManageTab("pending")}
                className={`flex-1 sm:flex-none py-2 px-5 text-sm font-black transition-all rounded-xl ${
                  manageTab === "pending"
                    ? "bg-white text-slate-900 border-2 border-transparent scale-100"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 outline-transparent"
                }`}
              >
                Pending Orders
                <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${manageTab === "pending" ? "bg-slate-100 text-slate-800" : "bg-white text-slate-500"}`}>
                  {pendingOrders.length}
                </span>
              </button>
              <button
                onClick={() => setManageTab("all")}
                className={`flex-1 sm:flex-none py-2 px-5 text-sm font-black transition-all rounded-xl ${
                  manageTab === "all"
                    ? "bg-white text-slate-900 border-2 border-transparent"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 outline-transparent"
                }`}
              >
                All History
                <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${manageTab === "all" ? "bg-slate-100 text-slate-800" : "bg-white text-slate-500"}`}>
                  {deliveries.length}
                </span>
              </button>
            </div>
            
            <button
              onClick={() => {
                setDeliveryAssignForm((prev) => ({ ...prev, orderId: "" }));
                setIsAssignDrawerOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-900 bg-slate-900 px-6 py-3 font-black text-white transition-all hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Assign Delivery
            </button>
          </div>
        </>
      )}

      {/* Modular Table Component */}
      <DeliveryTable
        viewMode={activeDeliveryView}
        manageTab={manageTab}
        pendingOrders={pendingOrders}
        deliveries={deliveries}
        deliveryUsers={deliveryUsers}
        normalizeRole={normalizeRole}
        deliveryStatusDrafts={deliveryStatusDrafts}
        setDeliveryStatusDrafts={setDeliveryStatusDrafts}
        handleDeliveryStatusUpdate={handleDeliveryStatusUpdate}
        onAssignOrder={(oid) => {
          setDeliveryAssignForm((prev) => ({ ...prev, orderId: oid }));
          setIsAssignDrawerOpen(true);
        }}
        onViewUserDetails={(user) => setSelectedUserForDrawer(user)}
        actionLoading={actionLoading}
      />

      {/* Drawers */}
      <AssignDeliveryDrawer 
        isOpen={isAssignDrawerOpen}
        onClose={() => setIsAssignDrawerOpen(false)}
        pendingOrders={pendingOrders}
        deliveryUsers={deliveryUsers}
        deliveryAssignForm={deliveryAssignForm}
        setDeliveryAssignForm={setDeliveryAssignForm}
        onAssignClick={onAssignClick}
        actionLoading={actionLoading}
      />

      <UserDeliveriesDrawer 
        isOpen={!!selectedUserForDrawer}
        user={selectedUserForDrawer}
        deliveries={userRecentDeliveries}
        normalizeRole={normalizeRole}
        onClose={() => setSelectedUserForDrawer(null)}
      />
    </div>
  );
};

export default DeliveryManagement;

