import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import LocationPickerMap from "../../../../client/components/LocationPickerMap";
import { formatMoney, resolveEntityId } from "../../../../../utils/helpers";

function ProductImage({ product }) {
  if (product?.imageUrl) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_#fff5d8,_#f3f4f6_65%)] text-xs font-semibold uppercase tracking-[0.25em] text-[#94a3b8]">
      {String(product?.category || "Item").slice(0, 10)}
    </div>
  );
}

ProductImage.propTypes = {
  product: PropTypes.object.isRequired,
};

const MakeOrder = ({
  orderForm,
  setOrderForm,
  orderCustomer,
  setOrderCustomer,
  products,
  handleAddItemToOrderDraft,
  handleLookupOrCreateOrderCustomer,
  handleCreateOrderByAdmin,
  actionLoading,
}) => {
  const categories = useMemo(() => {
    const grouped = new Map();

    products.forEach((product) => {
      const category = String(product?.category || "Uncategorized").trim();
      grouped.set(category, (grouped.get(category) || 0) + 1);
    });

    return Array.from(grouped.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [products]);

  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (!categories.length) {
      setSelectedCategory("");
      return;
    }

    if (!categories.some((category) => category.name === selectedCategory)) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) {
      return products;
    }

    return products.filter(
      (product) =>
        String(product?.category || "Uncategorized").trim() === selectedCategory,
    );
  }, [products, selectedCategory]);

  const selectedProduct = useMemo(() => {
    return (
      products.find(
        (product) => resolveEntityId(product) === orderForm.selectedProductId,
      ) || null
    );
  }, [orderForm.selectedProductId, products]);

  const subtotal = useMemo(() => {
    return orderForm.items.reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );
  }, [orderForm.items]);

  const loyaltyBalance = Number(orderCustomer?.loyaltyPoints || 0);
  const requestedLoyaltyPoints = Math.max(
    0,
    Number(orderForm.loyaltyPointsToUse || 0),
  );
  const loyaltyRedemptionValue = Math.min(requestedLoyaltyPoints, loyaltyBalance);
  const total = Math.max(0, subtotal - loyaltyRedemptionValue);
  const customerReady =
    !!orderCustomer &&
    orderCustomer.contactNumber === orderForm.customerContactNumber.trim();

  const handleCustomerFieldChange = (field, value) => {
    setOrderForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (
      (field === "customerContactNumber" &&
        value.trim() !== String(orderCustomer?.contactNumber || "").trim()) ||
      (field === "customerName" &&
        value.trim() !== String(orderCustomer?.name || "").trim())
    ) {
      setOrderCustomer(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-[32px] border border-[#e7e5df] bg-[#fffdfa] shadow-[0_22px_80px_rgba(15,23,42,0.08)]">
      <div className="grid min-h-[760px] gap-0 xl:grid-cols-[220px_minmax(0,1fr)_360px]">
        <aside className="border-b border-[#efeae2] bg-[#fcfaf6] p-5 xl:border-b-0 xl:border-r">
          <p className="text-sm font-medium text-[#9a8f7a]">Choose</p>
          <h3 className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-[#1f2937]">
            Category
          </h3>

          <div className="mt-5 space-y-3">
            {categories.map((category) => {
              const active = category.name === selectedCategory;

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => setSelectedCategory(category.name)}
                  className={[
                    "flex w-full items-center gap-3 rounded-[24px] border px-4 py-4 text-left transition",
                    active
                      ? "border-[#8d867e] bg-[#8f8a83] text-white shadow-[0_16px_30px_rgba(143,138,131,0.18)]"
                      : "border-[#ece6dd] bg-white text-[#1f2937] hover:border-[#d9cfbf] hover:bg-[#fffaf0]",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "h-14 w-14 shrink-0 rounded-2xl border",
                      active
                        ? "border-white/30 bg-white/20"
                        : "border-[#eee7db] bg-[#f5f3ef]",
                    ].join(" ")}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">
                      {category.name}
                    </p>
                    <p
                      className={[
                        "text-sm",
                        active ? "text-white/75" : "text-[#9ca3af]",
                      ].join(" ")}
                    >
                      {category.count} product{category.count === 1 ? "" : "s"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="border-b border-[#efeae2] bg-[#fffdfa] p-5 xl:border-b-0 xl:border-r xl:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#9a8f7a]">
                Admin make order
              </p>
              <h3 className="mt-1 text-[30px] font-semibold tracking-[-0.03em] text-[#111827]">
                Select products
              </h3>
            </div>

            {selectedProduct ? (
              <div className="rounded-2xl border border-[#efe7dc] bg-[#fff6ea] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a16207]">
                  Current pick
                </p>
                <p className="mt-1 text-sm font-semibold text-[#1f2937]">
                  {selectedProduct.name}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const productId = resolveEntityId(product);
              const active = productId === orderForm.selectedProductId;

              return (
                <article
                  key={productId}
                  className={[
                    "overflow-hidden rounded-[28px] border bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition",
                    active
                      ? "border-[#d8c3a5] ring-2 ring-[#f6d9b0]"
                      : "border-[#efebe5] hover:-translate-y-0.5 hover:border-[#e5d8c2]",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOrderForm((prev) => ({
                        ...prev,
                        selectedProductId: productId,
                      }))
                    }
                    className="block w-full text-left"
                  >
                    <div className="h-40 overflow-hidden rounded-[24px] bg-[#f3f4f6]">
                      <ProductImage product={product} />
                    </div>
                    <div className="mt-4">
                      <h4 className="text-[22px] font-semibold tracking-[-0.03em] text-[#111827]">
                        {product.name}
                      </h4>
                      <p className="mt-2 min-h-[44px] text-sm leading-6 text-[#6b7280]">
                        {product.description || "No description available."}
                      </p>
                    </div>
                  </button>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[18px] font-semibold text-[#111827]">
                        {formatMoney(product.price || 0)}
                      </p>
                      <p className="mt-1 text-sm text-[#9ca3af]">
                        {product.stock || 0} items in stock
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={
                          active
                            ? orderForm.selectedQuantity
                            : "1"
                        }
                        onChange={(event) =>
                          setOrderForm((prev) => ({
                            ...prev,
                            selectedProductId: productId,
                            selectedQuantity: event.target.value,
                          }))
                        }
                        className="w-16 rounded-2xl border border-[#e7ded3] bg-[#fffdfa] px-3 py-2 text-center text-sm font-semibold text-[#1f2937] outline-none focus:border-[#d8b37a] focus:ring-2 focus:ring-[#fde7c5]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setOrderForm((prev) => ({
                            ...prev,
                            selectedProductId: productId,
                            selectedQuantity:
                              active && prev.selectedQuantity
                                ? prev.selectedQuantity
                                : "1",
                          }));
                          handleAddItemToOrderDraft(
                            productId,
                            active ? orderForm.selectedQuantity : "1",
                          );
                        }}
                        className="rounded-2xl bg-[#1f2937] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#111827]"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="bg-white p-5 xl:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[30px] font-semibold tracking-[-0.03em] text-[#111827]">
                Order
              </h3>
              <p className="mt-1 text-sm text-[#8b95a7]">
                Verify customer loyalty, set delivery, and complete the order.
              </p>
            </div>
            <div className="rounded-2xl border border-[#efeae2] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8f7a]">
              Admin POS
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-[#ece6dc] bg-[#fdfaf5] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8f7a]">
                  Customer
                </p>
                <p className="mt-1 text-base font-semibold text-[#111827]">
                  Lookup loyalty account
                </p>
              </div>
              <div
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  customerReady
                    ? "bg-[#e8f8ee] text-[#166534]"
                    : "bg-[#fff1df] text-[#b45309]",
                ].join(" ")}
              >
                {customerReady ? "Verified" : "Pending"}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <input
                value={orderForm.customerContactNumber}
                onChange={(event) =>
                  handleCustomerFieldChange(
                    "customerContactNumber",
                    event.target.value,
                  )
                }
                placeholder="Customer phone number"
                className="w-full rounded-2xl border border-[#e4ddd2] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#d6b27a] focus:ring-2 focus:ring-[#fde7c5]"
              />
              <input
                value={orderForm.customerName}
                onChange={(event) =>
                  handleCustomerFieldChange("customerName", event.target.value)
                }
                placeholder="Customer name for new account"
                className="w-full rounded-2xl border border-[#e4ddd2] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#d6b27a] focus:ring-2 focus:ring-[#fde7c5]"
              />
              <button
                type="button"
                onClick={handleLookupOrCreateOrderCustomer}
                disabled={actionLoading === "order-customer-lookup"}
                className="w-full rounded-2xl bg-[#c07c2f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#a96822] disabled:opacity-50"
              >
                {actionLoading === "order-customer-lookup"
                  ? "Checking customer..."
                  : "Lookup or create customer"}
              </button>
            </div>

            {orderCustomer ? (
              <div className="mt-4 rounded-[24px] border border-[#dceadf] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-[#111827]">
                      {orderCustomer.name || "Walk-in Customer"}
                    </p>
                    <p className="mt-1 text-sm text-[#6b7280]">
                      {orderCustomer.contactNumber || "No contact number"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#eff8f0] px-3 py-2 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#15803d]">
                      Loyalty
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#166534]">
                      {loyaltyBalance} points
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#f8fafc] px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#94a3b8]">
                      Card number
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#1f2937]">
                      {orderCustomer.loyaltyCardNumber || "Generated automatically"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f8fafc] px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#94a3b8]">
                      Account status
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#1f2937]">
                      {orderCustomer.isActive === false ? "Inactive" : "Active"}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 space-y-3">
            {orderForm.items.length ? (
              orderForm.items.map((item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="flex items-center gap-3 rounded-[24px] border border-[#efe7dc] bg-[#fffdfa] p-3"
                >
                  <div className="h-16 w-16 overflow-hidden rounded-2xl bg-[#f3f4f6]">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-[linear-gradient(135deg,_#f5efe5,_#ece8e1)]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-[#111827]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-[#6b7280]">
                      {formatMoney(item.price || 0)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setOrderForm((prev) => ({
                          ...prev,
                          items: prev.items.map((entry) =>
                            entry.productId === item.productId
                              ? {
                                  ...entry,
                                  quantity: Math.max(
                                    1,
                                    Number(entry.quantity || 1) - 1,
                                  ),
                                }
                              : entry,
                          ),
                        }))
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd4c7] text-sm font-semibold text-[#4b5563]"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(event) =>
                        setOrderForm((prev) => ({
                          ...prev,
                          items: prev.items.map((entry) =>
                            entry.productId === item.productId
                              ? {
                                  ...entry,
                                  quantity: Math.min(
                                    item.stock,
                                    Math.max(
                                      1,
                                      Number(event.target.value || 1),
                                    ),
                                  ),
                                }
                              : entry,
                          ),
                        }))
                      }
                      className="w-12 rounded-xl border border-[#e4ddd2] bg-white px-2 py-1.5 text-center text-sm font-semibold text-[#111827] outline-none focus:border-[#d6b27a]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setOrderForm((prev) => ({
                          ...prev,
                          items: prev.items.map((entry) =>
                            entry.productId === item.productId
                              ? {
                                  ...entry,
                                  quantity: Math.min(
                                    item.stock,
                                    Number(entry.quantity || 1) + 1,
                                  ),
                                }
                              : entry,
                          ),
                        }))
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd4c7] text-sm font-semibold text-[#4b5563]"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setOrderForm((prev) => ({
                          ...prev,
                          items: prev.items.filter(
                            (entry) => entry.productId !== item.productId,
                          ),
                        }))
                      }
                      className="ml-1 rounded-full bg-[#f6efe5] px-3 py-1.5 text-xs font-semibold text-[#8a5a2b]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#ddd4c7] bg-[#fcfaf6] p-5 text-sm text-[#8b95a7]">
                Select products from the center panel to build the order.
              </div>
            )}
          </div>

          <div className="mt-6 rounded-[28px] border border-[#ece6dc] bg-[#fdfaf5] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8f7a]">
              Delivery details
            </p>
            <textarea
              rows={3}
              value={orderForm.deliveryAddress}
              onChange={(event) =>
                setOrderForm((prev) => ({
                  ...prev,
                  deliveryAddress: event.target.value,
                }))
              }
              placeholder="Delivery address"
              className="mt-3 w-full rounded-2xl border border-[#e4ddd2] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#d6b27a] focus:ring-2 focus:ring-[#fde7c5]"
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                type="number"
                step="any"
                value={orderForm.latitude}
                onChange={(event) =>
                  setOrderForm((prev) => ({
                    ...prev,
                    latitude: event.target.value,
                  }))
                }
                placeholder="Latitude"
                className="rounded-2xl border border-[#e4ddd2] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#d6b27a] focus:ring-2 focus:ring-[#fde7c5]"
              />
              <input
                type="number"
                step="any"
                value={orderForm.longitude}
                onChange={(event) =>
                  setOrderForm((prev) => ({
                    ...prev,
                    longitude: event.target.value,
                  }))
                }
                placeholder="Longitude"
                className="rounded-2xl border border-[#e4ddd2] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#d6b27a] focus:ring-2 focus:ring-[#fde7c5]"
              />
            </div>
            <div className="mt-4 overflow-hidden rounded-[24px]">
              <LocationPickerMap
                latitude={orderForm.latitude}
                longitude={orderForm.longitude}
                onChange={({ latitude, longitude }) =>
                  setOrderForm((prev) => ({
                    ...prev,
                    latitude,
                    longitude,
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-[#ece6dc] bg-[#fffdfa] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between text-sm text-[#6b7280]">
              <span>Subtotal</span>
              <span className="font-semibold text-[#111827]">
                {formatMoney(subtotal)}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="number"
                min="0"
                max={loyaltyBalance}
                value={orderForm.loyaltyPointsToUse}
                onChange={(event) =>
                  setOrderForm((prev) => ({
                    ...prev,
                    loyaltyPointsToUse: event.target.value,
                  }))
                }
                placeholder="Loyalty points"
                className="w-32 rounded-2xl border border-[#e4ddd2] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#d6b27a] focus:ring-2 focus:ring-[#fde7c5]"
              />
              <p className="text-sm text-[#6b7280]">
                Available: <span className="font-semibold">{loyaltyBalance}</span>
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-[#6b7280]">
              <span>Loyalty redemption</span>
              <span className="font-semibold text-[#166534]">
                - {formatMoney(loyaltyRedemptionValue)}
              </span>
            </div>
            <div className="mt-4 border-t border-[#efeae2] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-[#374151]">
                  Total
                </span>
                <span className="text-[26px] font-semibold tracking-[-0.03em] text-[#111827]">
                  {formatMoney(total)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCreateOrderByAdmin}
              disabled={actionLoading === "create-admin-order"}
              className="mt-5 w-full rounded-[22px] bg-[#8f8a83] px-4 py-4 text-sm font-semibold text-white transition hover:bg-[#7e786f] disabled:opacity-50"
            >
              {actionLoading === "create-admin-order"
                ? "Creating order..."
                : "Place customer order"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

MakeOrder.propTypes = {
  orderForm: PropTypes.object.isRequired,
  setOrderForm: PropTypes.func.isRequired,
  orderCustomer: PropTypes.object,
  setOrderCustomer: PropTypes.func.isRequired,
  products: PropTypes.array.isRequired,
  handleAddItemToOrderDraft: PropTypes.func.isRequired,
  handleLookupOrCreateOrderCustomer: PropTypes.func.isRequired,
  handleCreateOrderByAdmin: PropTypes.func.isRequired,
  actionLoading: PropTypes.string.isRequired,
};

MakeOrder.defaultProps = {
  orderCustomer: null,
};

export default MakeOrder;
