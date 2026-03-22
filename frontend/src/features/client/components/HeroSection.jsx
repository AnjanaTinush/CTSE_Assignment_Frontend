import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { formatMoney } from "../../../utils/helpers";

export default function HeroSection({ cartCount, subtotal, loyaltyBalance }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-3xl border border-[#d9e2ec] bg-white"
        >
            <div className="bg-[#f8fafd] px-5 py-6 sm:px-6">
                <p className="text-xs uppercase tracking-[0.2em] text-[#5f6368]">Anjana Grocery</p>
                <h1 className="mt-2 text-2xl font-semibold leading-tight text-[#202124] sm:text-3xl">
                    Fresh groceries, simpler ordering, better mobile experience.
                </h1>
                <p className="mt-2 text-sm text-[#5f6368]">
                    Search products, add to cart, checkout quickly, and track every order.
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[#dce7f3] bg-white px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wide text-[#5f6368]">Cart items</p>
                        <p className="text-base font-semibold text-[#202124]">{cartCount}</p>
                    </div>
                    <div className="rounded-2xl border border-[#dce7f3] bg-white px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wide text-[#5f6368]">Subtotal</p>
                        <p className="text-base font-semibold text-[#202124]">{formatMoney(subtotal)}</p>
                    </div>
                    <div className="rounded-2xl border border-[#dce7f3] bg-white px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wide text-[#5f6368]">Loyalty</p>
                        <p className="text-base font-semibold text-[#202124]">{loyaltyBalance} pts</p>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}

HeroSection.propTypes = {
    cartCount: PropTypes.number.isRequired,
    subtotal: PropTypes.number.isRequired,
    loyaltyBalance: PropTypes.number.isRequired,
};
