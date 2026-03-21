import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Loader from "../../../components/ui/Loader";
import StatusPill from "../../../components/ui/StatusPill";
import { useAppContext } from "../../../app/providers/AppProvider";
import { DeliveryService } from "../../../services/delivery.service";
import { formatDate, resolveEntityId } from "../../../utils/helpers";

const DELIVERY_ACTIONS = [
  {
    status: "PICKED_UP",
    label: "Mark Picked Up",
    tone: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  {
    status: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    tone: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
  {
    status: "COMPLETED",
    label: "Delivered",
    tone: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  {
    status: "CANCELLED_BY_DELIVERY",
    label: "Cancel / Issue",
    tone: "bg-rose-100 hover:bg-rose-200 text-rose-700",
  },
];

const TERMINAL_STATUSES = new Set([
  "COMPLETED",
  "CANCELLED_BY_DELIVERY",
  "FAILED",
  "RETURNED",
]);

export default function DeliveryPortalPage() {
  const navigate = useNavigate();
  const { auth, logout } = useAppContext();

  const [state, setState] = useState({
    loading: true,
    error: "",
    deliveries: [],
  });
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [notesByDelivery, setNotesByDelivery] = useState({});
  const [activeTab, setActiveTab] = useState("upcoming");

  const loadDeliveries = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await DeliveryService.getMyTodayDeliveries();
      const deliveries = Array.isArray(response) ? response : [];

      setState({
        loading: false,
        error: "",
        deliveries,
      });
    } catch (error) {
      setState({
        loading: false,
        error:
          error?.friendlyMessage ||
          error?.message ||
          "Unable to load today assignments",
        deliveries: [],
      });
    }
  }, []);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const handleUpdateStatus = async (deliveryId, status) => {
    setActionError("");
    setActionSuccess("");
    setActionLoading(`${deliveryId}:${status}`);

    try {
      await DeliveryService.updateDeliveryStatus(deliveryId, {
        status,
        notes: notesByDelivery[deliveryId] || undefined,
      });

      setActionSuccess("Delivery status updated.");
      await loadDeliveries();
    } catch (error) {
      setActionError(
        error?.friendlyMessage ||
          error?.message ||
          "Failed to update delivery status",
      );
    } finally {
      setActionLoading("");
    }
  };

  const upcomingDeliveries = useMemo(
    () =>
      state.deliveries.filter(
        (d) => !TERMINAL_STATUSES.has(String(d?.status).toUpperCase()),
      ),
    [state.deliveries],
  );

  const pastDeliveries = useMemo(
    () =>
      state.deliveries.filter((d) =>
        TERMINAL_STATUSES.has(String(d?.status).toUpperCase()),
      ),
    [state.deliveries],
  );

  const completedCount = pastDeliveries.filter(
    (d) => String(d?.status).toUpperCase() === "COMPLETED"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Driver Portal
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Welcome back, {auth?.user?.name || auth?.user?.contactNumber || 'Driver'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadDeliveries}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Sync
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        
        {/* Messages */}
        <div className="mb-6 space-y-3">
          <ErrorMessage message={state.error} />
          <ErrorMessage message={actionError} />
          {actionSuccess ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              {actionSuccess}
            </div>
          ) : null}
        </div>

        {/* Global Summary Layer */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Assigned
            </p>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800">{state.deliveries.length}</span>
              <span className="text-sm font-medium text-slate-500">today</span>
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Next
            </p>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-600">{upcomingDeliveries.length}</span>
              <span className="text-sm font-medium text-slate-500">deliveries</span>
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completed
            </p>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600">{completedCount}</span>
              <span className="text-sm font-medium text-slate-500">successful</span>
            </p>
          </div>
        </div>

        {/* Flat Tabs Section */}
        <div className="mb-6 flex space-x-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 ${
              activeTab === "upcoming"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            Upcoming Tasks
            <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {upcomingDeliveries.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 ${
              activeTab === "activity"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            My Activity
            <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {pastDeliveries.length}
            </span>
          </button>
        </div>

        {/* Content Section */}
        {state.loading ? (
          <div className="py-12">
            <Loader text="Loading your assignments..." />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {(activeTab === "upcoming" ? upcomingDeliveries : pastDeliveries).length === 0 ? (
              <div className="col-span-full rounded-2xl border border-slate-200 bg-white py-16 text-center">
                <p className="text-sm font-medium text-slate-500">
                  {activeTab === "upcoming"
                    ? "You have no upcoming deliveries assigned."
                    : "No past activity recorded for today."}
                </p>
              </div>
            ) : (
              (activeTab === "upcoming" ? upcomingDeliveries : pastDeliveries).map(
                (delivery) => {
                  const id = resolveEntityId(delivery);
                  const status = String(delivery?.status || "ASSIGNED").toUpperCase();
                  const isTerminal = TERMINAL_STATUSES.has(status);

                  return (
                    <article
                      key={id}
                      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:bg-slate-50"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Order No.
                          </p>
                          <h2 className="text-lg font-black text-slate-800 break-all">
                            Order #{String(delivery?.orderId)}
                          </h2>
                        </div>
                        <StatusPill status={status} />
                      </div>

                      {/* Info Panel */}
                      <div className="flex-1 space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm shadow-slate-100/50">
                        <div className="flex justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone</span>
                          <span className="text-sm font-semibold text-slate-700">
                            {delivery?.customerContactNumber || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned</span>
                          <span className="text-sm font-semibold text-slate-700">
                            {formatDate(delivery?.assignedAt)}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Destination</span>
                          <span className="text-sm font-semibold text-slate-700">
                            {delivery?.deliveryLocation?.address || "Address not provided"}
                          </span>
                          {(delivery?.deliveryLocation?.latitude || delivery?.deliveryLocation?.longitude) && (
                            <span className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {delivery?.deliveryLocation?.latitude || "-"}, {delivery?.deliveryLocation?.longitude || "-"}
                            </span>
                          )}
                        </div>
                        {delivery?.notes && (
                          <div className="flex flex-col gap-1 border-t border-slate-200/60 pt-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Shipment Notes</span>
                            <span className="text-sm font-medium italic text-slate-600">
                              "{delivery.notes}"
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Controls (Only if not terminal) */}
                      {!isTerminal && (
                        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase text-slate-400 text-nowrap">Tracking Note</span>
                            <input
                              type="text"
                              value={notesByDelivery[id] || ""}
                              onChange={(event) =>
                                setNotesByDelivery((prev) => ({
                                  ...prev,
                                  [id]: event.target.value,
                                }))
                              }
                              placeholder="E.g. Traffic delay, arrived..."
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {DELIVERY_ACTIONS.map((action) => (
                              <button
                                key={action.status}
                                type="button"
                                disabled={
                                  actionLoading === `${id}:${action.status}` ||
                                  status === action.status
                                }
                                onClick={() => handleUpdateStatus(id, action.status)}
                                className={`rounded-xl px-2 py-2.5 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${action.tone}`}
                              >
                                {actionLoading === `${id}:${action.status}`
                                  ? "..."
                                  : action.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                }
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
