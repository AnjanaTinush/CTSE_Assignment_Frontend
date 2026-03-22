import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import LocationPickerMap from "../../../components/layout/LocationPickerMap";
import { useAppContext } from "../../../app/providers/AppProvider";
import { AuthService } from "../../../services/auth.service";
import { OrderService } from "../../../services/order.service";
import { authStore } from "../../../app/store/authStore";
import {
    clientStore,
    getCartCount,
    getCartItems,
    getCartSubtotal,
    useClientStore,
} from "../clientStore";
import { formatMoney, resolveRole } from "../../../utils/helpers";
import { getDefaultRouteForRole } from "../../../utils/roleRouting";

const EMPTY_CHECKOUT = {
    address: "",
    latitude: "",
    longitude: "",
    loyaltyPointsToUse: "0",
};

function toOrderItem(item) {
    return {
        productId: item.product?.id,
        quantity: Number(item.quantity || 0),
    };
}

export default function CartPage() {
    const navigate = useNavigate();
    const { auth } = useAppContext();
    const role = resolveRole(auth?.user);
    const isLoggedIn = Boolean(auth?.isAuthenticated);
    const isUser = role === "USER";
    const loyaltyBalance = Number(auth?.user?.loyaltyPoints || 0);

    const store = useClientStore();
    const cartItems = useMemo(() => getCartItems(store), [store]);
    const itemCount = useMemo(() => getCartCount(store), [store]);
    const subtotal = useMemo(() => getCartSubtotal(store), [store]);

    const [checkout, setCheckout] = useState(EMPTY_CHECKOUT);
    const [orderError, setOrderError] = useState("");
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState("");

    const loyaltyPointsToUse = Math.max(0, Number(checkout.loyaltyPointsToUse || 0));
    const loyaltyDiscountValue = useMemo(
        () => (isLoggedIn && isUser ? Math.min(loyaltyBalance, loyaltyPointsToUse) : 0),
        [isLoggedIn, isUser, loyaltyBalance, loyaltyPointsToUse],
    );
    const estimatedTotal = useMemo(
        () => Math.max(0, subtotal - loyaltyDiscountValue),
        [subtotal, loyaltyDiscountValue],
    );

    const handleQuantity = (item, nextQuantity) => {
        const normalized = Math.max(0, Number(nextQuantity || 0));
        clientStore.setItem(item.product, normalized);
    };

    const handleCheckoutField = (event) => {
        setCheckout((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }));
    };

    const handleLocationChange = ({ latitude, longitude, locationName }) => {
        setCheckout((prev) => ({
            ...prev,
            latitude,
            longitude,
            address:
                typeof locationName === "string" && locationName.trim()
                    ? locationName
                    : prev.address,
        }));
    };

    const handlePlaceOrder = async (event) => {
        event.preventDefault();
        setOrderError("");
        setOrderSuccess("");

        if (!isLoggedIn) {
            navigate("/login", { replace: false });
            return;
        }

        if (!isUser) {
            navigate(getDefaultRouteForRole(role), { replace: true });
            return;
        }

        if (!cartItems.length) {
            setOrderError("Your cart is empty.");
            return;
        }

        if (!checkout.address.trim()) {
            setOrderError("Delivery address is required.");
            return;
        }

        if (!checkout.latitude || !checkout.longitude) {
            setOrderError("Please select your delivery location from the map.");
            return;
        }

        setOrderLoading(true);

        try {
            await OrderService.createOrder({
                items: cartItems.map(toOrderItem),
                deliveryLocation: {
                    address: checkout.address.trim(),
                    latitude: Number(checkout.latitude),
                    longitude: Number(checkout.longitude),
                },
                loyaltyPointsToUse,
            });

            clientStore.clearCart();
            setCheckout(EMPTY_CHECKOUT);
            setOrderSuccess("Order placed successfully.");

            try {
                const me = await AuthService.getCurrentUser();
                authStore.updateUser(me);
            } catch (refreshError) {
                console.warn("Unable to refresh user after order placement", refreshError);
            }

            navigate("/my-orders");
        } catch (error) {
            setOrderError(error?.friendlyMessage || error?.message || "Failed to place order");
        } finally {
            setOrderLoading(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-[#d9e2ec] bg-white p-5 shadow-sm">
                <h1 className="text-2xl font-semibold text-[#202124]">Cart</h1>
                <p className="mt-1 text-sm text-[#5f6368]">Review items, set location, and checkout.</p>
            </div>

            <ErrorMessage message={orderError} />
            <ErrorMessage
                message={orderSuccess ? { message: orderSuccess, severity: "success" } : ""}
            />

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
                <section className="space-y-3 rounded-3xl border border-[#d9e2ec] bg-white p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-[#202124]">Selected items</h2>
                        <span className="rounded-full bg-[#e8f0fe] px-3 py-1 text-xs font-semibold text-[#174ea6]">
                            {itemCount} item(s)
                        </span>
                    </div>

                    {cartItems.length ? (
                        <div className="space-y-3">
                            {cartItems.map((item) => (
                                <div
                                    key={item.product?.id}
                                    className="rounded-2xl border border-[#e3e8ef] bg-[#f8fafd] p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-[#202124]">{item.product?.name}</p>
                                            <p className="text-xs text-[#5f6368]">{formatMoney(item.product?.price)} each</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => clientStore.removeItem(item.product?.id)}
                                            className="text-xs font-semibold text-[#b3261e]"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <div className="mt-2 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleQuantity(item, item.quantity - 1)}
                                            className="rounded-full border border-[#d3dce6] px-3 py-1 text-xs font-semibold"
                                        >
                                            -
                                        </button>
                                        <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleQuantity(item, item.quantity + 1)}
                                            className="rounded-full border border-[#d3dce6] px-3 py-1 text-xs font-semibold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-[#d9e2ec] bg-[#f8fafd] px-4 py-6 text-sm text-[#5f6368]">
                            No items in cart. <Link to="/" className="font-semibold text-[#1967d2]">Go to products</Link>
                        </div>
                    )}
                </section>

                <aside className="space-y-4">
                    <section className="rounded-3xl border border-[#d9e2ec] bg-white p-4 shadow-sm sm:p-5">
                        <h2 className="text-lg font-semibold text-[#202124]">Order summary</h2>
                        <div className="mt-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between text-[#3c4043]">
                                <span>Subtotal</span>
                                <span>{formatMoney(subtotal)}</span>
                            </div>

                            {isLoggedIn && isUser ? (
                                <>
                                    <div className="flex items-center justify-between text-[#3c4043]">
                                        <span>Loyalty discount</span>
                                        <span>- {formatMoney(loyaltyDiscountValue)}</span>
                                    </div>
                                    <div className="rounded-xl border border-[#d8eced] bg-[#ecfeff] px-3 py-2 text-xs text-[#155e75]">
                                        Loyalty available: {loyaltyBalance} points
                                    </div>
                                </>
                            ) : null}

                            <div className="flex items-center justify-between border-t border-[#e3e8ef] pt-2 text-base font-semibold text-[#202124]">
                                <span>Estimated total</span>
                                <span>{formatMoney(estimatedTotal)}</span>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-[#d9e2ec] bg-white p-4 shadow-sm sm:p-5">
                        <h2 className="text-lg font-semibold text-[#202124]">Checkout</h2>
                        {!isLoggedIn ? (
                            <p className="mt-2 text-sm text-[#5f6368]">
                                Please <Link to="/login" className="font-semibold text-[#1967d2]">login</Link> to place an order.
                            </p>
                        ) : null}

                        <form className="mt-3 space-y-3" onSubmit={handlePlaceOrder}>
                            <textarea
                                name="address"
                                rows={3}
                                value={checkout.address}
                                onChange={handleCheckoutField}
                                placeholder="Delivery address"
                                className="w-full rounded-2xl border border-[#d3dce6] bg-[#f8fafd] px-3 py-2 text-sm outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc]"
                            />

                            <LocationPickerMap
                                latitude={checkout.latitude}
                                longitude={checkout.longitude}
                                onChange={handleLocationChange}
                            />

                            <p className="rounded-xl border border-[#e3e8ef] bg-[#f8fafd] px-3 py-2 text-xs text-[#5f6368]">
                                Selected coordinates: {checkout.latitude || "-"}, {checkout.longitude || "-"}
                            </p>

                            {isLoggedIn && isUser ? (
                                <div className="space-y-2 rounded-2xl border border-[#e3e8ef] bg-[#f8fafd] p-3">
                                    <label
                                        htmlFor="cartLoyaltyPoints"
                                        className="block text-xs font-semibold uppercase tracking-wide text-[#5f6368]"
                                    >
                                        Loyalty points to use
                                    </label>
                                    <input
                                        id="cartLoyaltyPoints"
                                        name="loyaltyPointsToUse"
                                        type="number"
                                        min="0"
                                        value={checkout.loyaltyPointsToUse}
                                        onChange={handleCheckoutField}
                                        className="w-full rounded-xl border border-[#d3dce6] bg-white px-3 py-2 text-sm outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#d2e3fc]"
                                    />
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                disabled={orderLoading || !isLoggedIn || !isUser || !cartItems.length}
                                className="w-full rounded-full bg-[#1a73e8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1557b0] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {orderLoading ? "Placing order..." : "Place Order"}
                            </button>
                        </form>
                    </section>
                </aside>
            </div>
        </div>
    );
}
