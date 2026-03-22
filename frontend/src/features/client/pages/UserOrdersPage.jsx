import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import Loader from "../../../components/ui/Loader";
import StatusPill from "../../../components/ui/StatusPill";
import { OrderService } from "../../../services/order.service";
import { AuthService } from "../../../services/auth.service";
import { authStore } from "../../../app/store/authStore";
import {
  asCollection,
  formatDate,
  formatMoney,
  resolveEntityId,
} from "../../../utils/helpers";
import LocationPickerMap from "../../../components/layout/LocationPickerMap";

function buildDraft(order) {
  return {
    items: (order?.items || []).map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
    })),
    deliveryLocation: {
      address: order?.deliveryLocation?.address || "",
      latitude: order?.deliveryLocation?.latitude || "",
      longitude: order?.deliveryLocation?.longitude || "",
    },
  };
}

export default function UserOrdersPage() {
  const [state, setState] = useState({ loading: true, error: "", orders: [] });
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const [editingOrderId, setEditingOrderId] = useState("");
  const [editDraft, setEditDraft] = useState(null);
  const [cancelReasonByOrder, setCancelReasonByOrder] = useState({});

  const loadOrders = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await OrderService.getMyOrders();
      const orders = asCollection(response, ["orders"]).sort((left, right) => {
        const leftTime = new Date(left?.createdAt || 0).getTime();
        const rightTime = new Date(right?.createdAt || 0).getTime();
        return rightTime - leftTime;
      });

      setState({ loading: false, error: "", orders });
    } catch (error) {
      setState({
        loading: false,
        error:
          error?.friendlyMessage ||
          error?.message ||
          "Unable to load your orders",
        orders: [],
      });
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const orders = state.orders;

  const pendingCount = useMemo(
    () =>
      orders.filter(
        (order) => String(order?.status || "").toUpperCase() === "PENDING",
      ).length,
    [orders],
  );

  const completedCount = useMemo(
    () =>
      orders.filter(
        (order) => String(order?.status || "").toUpperCase() === "COMPLETED",
      ).length,
    [orders],
  );

  const handleOpenEdit = (order) => {
    setEditingOrderId(resolveEntityId(order));
    setEditDraft(buildDraft(order));
    setActionError("");
    setActionSuccess("");
  };

  const handleDraftQuantity = (productId, quantity) => {
    setEditDraft((prev) => {
      if (!prev) {
        return prev;
      }

      const nextItems = prev.items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(0, Number(quantity || 0)) }
          : item,
      );

      return {
        ...prev,
        items: nextItems,
      };
    });
  };

  const handleDraftLocationChange = ({ latitude, longitude, locationName }) => {
    setEditDraft((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        deliveryLocation: {
          ...prev.deliveryLocation,
          latitude,
          longitude,
          address:
            typeof locationName === "string" && locationName.trim()
              ? locationName
              : prev.deliveryLocation.address,
        },
      };
    });
  };

  const handleSaveEdit = async (orderId) => {
    if (!editDraft) {
      return;
    }

    setActionError("");
    setActionSuccess("");

    const normalizedItems = editDraft.items
      .filter((item) => Number(item.quantity) > 0)
      .map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      }));

    if (!normalizedItems.length) {
      setActionError("At least one item quantity must be greater than 0.");
      return;
    }

    if (!editDraft.deliveryLocation.address.trim()) {
      setActionError("Delivery address is required.");
      return;
    }

    if (
      !editDraft.deliveryLocation.latitude ||
      !editDraft.deliveryLocation.longitude
    ) {
      setActionError("Please select a delivery location on the map.");
      return;
    }

    setActionLoading(`edit:${orderId}`);

    try {
      await OrderService.updatePendingOrder(orderId, {
        items: normalizedItems,
        deliveryLocation: {
          address: editDraft.deliveryLocation.address.trim(),
          latitude: Number(editDraft.deliveryLocation.latitude),
          longitude: Number(editDraft.deliveryLocation.longitude),
        },
      });

      setEditingOrderId("");
      setEditDraft(null);
      setActionSuccess("Pending order updated successfully.");
      await loadOrders();
    } catch (error) {
      setActionError(
        error?.friendlyMessage ||
        error?.message ||
        "Failed to update pending order",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleCancelOrder = async (orderId) => {
    setActionError("");
    setActionSuccess("");
    setActionLoading(`cancel:${orderId}`);

    try {
      const reason = (cancelReasonByOrder[orderId] || "").trim();
      await OrderService.cancelOrder(orderId, reason);
      setActionSuccess("Order cancelled successfully.");

      try {
        const me = await AuthService.getCurrentUser();
        authStore.updateUser(me);
      } catch (refreshError) {
        console.warn("Unable to refresh user after cancellation", refreshError);
      }

      await loadOrders();
    } catch (error) {
      setActionError(
        error?.friendlyMessage || error?.message || "Failed to cancel order",
      );
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[1180px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-[#e0f2fe] via-[#f8fafc] to-transparent" />

      <div className="rounded-3xl border border-[#d4e3f1] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-[#0f172a]">My Orders</h1>
            <p className="mt-1 text-sm text-[#64748b]">
              Review, track, edit, and cancel pending orders.
            </p>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            className="rounded-full border border-[#cad8e7] px-4 py-2 text-xs font-semibold text-[#334155] transition hover:bg-[#f8fbff]"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#d8e5f2] bg-[#f8fbff] px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Total</p>
            <p className="text-lg font-semibold text-[#0f172a]">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-[#d8e5f2] bg-[#f8fbff] px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Pending</p>
            <p className="text-lg font-semibold text-[#0369a1]">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-[#d8e5f2] bg-[#f8fbff] px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Completed</p>
            <p className="text-lg font-semibold text-[#0f766e]">{completedCount}</p>
          </div>
        </div>
      </div>

      <ErrorMessage message={state.error} />
      <ErrorMessage message={actionError} />
      <ErrorMessage
        message={actionSuccess ? { message: actionSuccess, severity: "success" } : ""}
      />

      {state.loading ? <Loader text="Loading your orders..." /> : null}

      {state.loading || orders.length ? null : (
        <div className="mt-4 rounded-2xl border border-[#dbe5f7] bg-white p-6 text-sm text-[#64748b]">
          No orders yet. Start shopping from{" "}
          <Link className="font-semibold text-[#0f766e] underline" to="/">
            home
          </Link>
          .
        </div>
      )}

      {state.loading ? null : (
        <div className="mt-4 space-y-4">
          {orders.map((order) => {
            const orderId = resolveEntityId(order);
            const status = String(order?.status || "PENDING").toUpperCase();
            const isPending = status === "PENDING";
            const isEditing = editingOrderId === orderId;

            return (
              <article
                key={orderId}
                className="rounded-3xl border border-[#d8e4f1] bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.06)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#64748b]">Order</p>
                    <h2 className="text-lg font-semibold text-[#0f172a]">{orderId}</h2>
                    <p className="mt-1 text-xs text-[#64748b]">Placed on {formatDate(order?.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={status} />
                    <Link
                      to={`/orders/${orderId}/tracking`}
                      className="rounded-full border border-[#cad7e6] px-3 py-1 text-xs font-semibold text-[#334155] transition hover:bg-[#f8fbff]"
                    >
                      Track
                    </Link>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#e3ebf5] bg-[#f8fbff] p-3">
                    <p className="text-xs uppercase tracking-wide text-[#64748b]">Items</p>
                    <ul className="mt-2 space-y-1 text-sm text-[#334155]">
                      {(order?.items || []).map((item) => (
                        <li
                          key={`${orderId}-${item.productId}`}
                          className="flex items-center justify-between gap-3"
                        >
                          <span>{item.name}</span>
                          <span>x {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-[#e3ebf5] bg-[#f8fbff] p-3 text-sm text-[#334155]">
                    <p className="text-xs uppercase tracking-wide text-[#64748b]">Billing</p>
                    <p className="mt-2">Subtotal: {formatMoney(order?.subtotal)}</p>
                    <p>Loyalty used: {order?.loyaltyPointsUsed || 0}</p>
                    <p>Total: {formatMoney(order?.totalAmount)}</p>
                    <p className="mt-2 text-xs text-[#64748b]">
                      Payment: {order?.paymentMethod || "CASH_ON_DELIVERY"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-[#e3ebf5] bg-[#f8fbff] p-3 text-sm text-[#334155]">
                  <p className="text-xs uppercase tracking-wide text-[#64748b]">Delivery location</p>
                  <p className="mt-1">{order?.deliveryLocation?.address || "N/A"}</p>
                  <p className="text-xs text-[#64748b]">
                    {order?.deliveryLocation?.latitude || "-"},{" "}
                    {order?.deliveryLocation?.longitude || "-"}
                  </p>
                </div>

                {isPending ? (
                  <div className="mt-4 space-y-3 rounded-2xl border border-[#f2dcc5] bg-[#fff8f1] p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          isEditing ? setEditingOrderId("") : handleOpenEdit(order)
                        }
                        className="rounded-full border border-[#d7c6af] px-3 py-1 text-xs font-semibold text-[#334155] transition hover:bg-white"
                      >
                        {isEditing ? "Close Edit" : "Edit Pending Order"}
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading === `cancel:${orderId}`}
                        onClick={() => handleCancelOrder(orderId)}
                        className="rounded-full bg-[#dc2626] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#b91c1c] disabled:opacity-50"
                      >
                        {actionLoading === `cancel:${orderId}` ? "Cancelling..." : "Cancel Order"}
                      </button>
                    </div>

                    <input
                      value={cancelReasonByOrder[orderId] || ""}
                      onChange={(event) =>
                        setCancelReasonByOrder((prev) => ({
                          ...prev,
                          [orderId]: event.target.value,
                        }))
                      }
                      placeholder="Cancellation reason (optional)"
                      className="w-full rounded-xl border border-[#dbc6aa] bg-white px-3 py-2 text-sm text-[#1f2937] outline-none transition focus:border-[#fb923c] focus:ring-2 focus:ring-[#ffedd5]"
                    />

                    {isEditing && editDraft ? (
                      <div className="space-y-3 rounded-2xl border border-[#e8d5bf] bg-white p-3">
                        <p className="text-sm font-semibold text-[#1e293b]">Edit items and location</p>

                        <div className="space-y-2">
                          {editDraft.items.map((item) => (
                            <div
                              key={`${orderId}-${item.productId}`}
                              className="flex items-center justify-between gap-3"
                            >
                              <span className="text-sm text-[#334155]">{item.name}</span>
                              <input
                                type="number"
                                min="0"
                                value={item.quantity}
                                onChange={(event) =>
                                  handleDraftQuantity(item.productId, event.target.value)
                                }
                                className="w-24 rounded-lg border border-[#d8c7ae] px-2 py-1 text-sm text-[#1f2937] outline-none focus:border-[#fb923c] focus:ring-2 focus:ring-[#ffedd5]"
                              />
                            </div>
                          ))}
                        </div>

                        <textarea
                          rows={2}
                          value={editDraft.deliveryLocation.address}
                          onChange={(event) =>
                            setEditDraft((prev) => ({
                              ...prev,
                              deliveryLocation: {
                                ...prev.deliveryLocation,
                                address: event.target.value,
                              },
                            }))
                          }
                          placeholder="Delivery address"
                          className="w-full rounded-xl border border-[#d8c7ae] px-3 py-2 text-sm text-[#1f2937] outline-none focus:border-[#fb923c] focus:ring-2 focus:ring-[#ffedd5]"
                        />

                        <LocationPickerMap
                          latitude={editDraft.deliveryLocation.latitude}
                          longitude={editDraft.deliveryLocation.longitude}
                          onChange={handleDraftLocationChange}
                        />

                        <p className="rounded-xl border border-[#f1e2d0] bg-[#fffaf5] px-3 py-2 text-xs text-[#475569]">
                          Selected coordinates: {editDraft.deliveryLocation.latitude || "-"},{" "}
                          {editDraft.deliveryLocation.longitude || "-"}
                        </p>

                        <button
                          type="button"
                          disabled={actionLoading === `edit:${orderId}`}
                          onClick={() => handleSaveEdit(orderId)}
                          className="rounded-full bg-[#ea580c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c2410c] disabled:opacity-50"
                        >
                          {actionLoading === `edit:${orderId}` ? "Saving..." : "Save Pending Order"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
