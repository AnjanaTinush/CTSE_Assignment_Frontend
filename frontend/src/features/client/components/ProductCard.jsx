import PropTypes from "prop-types";
import StatusPill from "../../../components/ui/StatusPill";
import { formatMoney } from "../../../utils/helpers";

export default function ProductCard({
    product,
    stock,
    inStock,
    quantityInCart,
    onDecrease,
    onIncrease,
    onAdd,
}) {
    return (
        <article className="rounded-3xl border border-[#d9e2ec] bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-[#eceff3] bg-[#f8fafd]">
                <img
                    src={
                        product?.imageUrl ||
                        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"
                    }
                    alt={product?.name || "Product"}
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-base font-semibold text-[#202124]">
                        {product?.name || "Unnamed product"}
                    </h3>
                    <p className="mt-1 text-xs uppercase tracking-wide text-[#5f6368]">
                        {product?.category || "General"}
                    </p>
                </div>
                <StatusPill status={inStock ? "IN_STOCK" : "OUT_OF_STOCK"} />
            </div>

            <p className="mt-2 min-h-[40px] text-sm text-[#5f6368]">
                {product?.description || "No description"}
            </p>

            <div className="mt-3 flex items-center justify-between">
                <p className="text-lg font-semibold text-[#1967d2]">{formatMoney(product?.price)}</p>
                <p className="text-xs text-[#5f6368]">Stock: {stock}</p>
            </div>

            <div className="mt-3 flex items-center gap-2">
                <button
                    type="button"
                    disabled={!inStock || quantityInCart <= 0}
                    onClick={onDecrease}
                    className="rounded-full border border-[#d3dce6] px-3 py-1.5 text-xs font-semibold text-[#3c4043] disabled:opacity-40"
                >
                    -
                </button>
                <span className="min-w-8 text-center text-sm font-semibold text-[#202124]">{quantityInCart}</span>
                <button
                    type="button"
                    disabled={!inStock || quantityInCart >= stock}
                    onClick={onIncrease}
                    className="rounded-full border border-[#d3dce6] px-3 py-1.5 text-xs font-semibold text-[#3c4043] disabled:opacity-40"
                >
                    +
                </button>

                <button
                    type="button"
                    disabled={!inStock}
                    onClick={onAdd}
                    className="ml-auto rounded-full bg-[#1a73e8] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1557b0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Add
                </button>
            </div>
        </article>
    );
}

ProductCard.propTypes = {
    product: PropTypes.shape({
        name: PropTypes.string,
        category: PropTypes.string,
        description: PropTypes.string,
        imageUrl: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }).isRequired,
    stock: PropTypes.number.isRequired,
    inStock: PropTypes.bool.isRequired,
    quantityInCart: PropTypes.number.isRequired,
    onDecrease: PropTypes.func.isRequired,
    onIncrease: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
};
