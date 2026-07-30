import { useMemo } from "react";
import { FaEllipsisVertical } from "react-icons/fa6";
import { normalizeAssetUrl } from "../../utils/content";

function formatPrice(amount, currency) {
  const numeric = Number(amount ?? 0);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "NGN",
      maximumFractionDigits: 0,
    }).format(numeric);
  } catch {
    return `${currency || "NGN"} ${numeric}`;
  }
}

function ProductSection({ products = [], orders = [], loading = false }) {
  const soldByProductId = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      if (order?.status === "cancelled") return;
      const productId = order?.product?.id ?? order?.merchProductId ?? order?.merch_product_id;
      if (productId == null) return;
      map[productId] = (map[productId] ?? 0) + Number(order?.quantity ?? 0);
    });
    return map;
  }, [orders]);

  return (
    <div className="flex flex-col gap-6 border border-black/20 dark:border-white/20 rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg md:text-xl font-bold text-black dark:text-white">Products</h3>
        <button className="bg-orange100 text-black text-xs font-bold rounded-lg py-2 md:py-3 px-4 md:px-8">Add Product</button>
      </div>

      <div className="flex flex-col gap-5 ">
        {loading && products.length === 0 ? (
          <div className="text-sm text-slate700 font-inter">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="text-sm text-slate700 font-inter">No products yet.</div>
        ) : (
          products.map((product) => {
            const totalSold = soldByProductId[product.id] ?? 0;
            const isSoldOut = Number(product?.inventoryCount ?? 0) <= 0;
            const image = Array.isArray(product?.images) && product.images.length > 0
              ? normalizeAssetUrl(product.images[0])
              : "";
            return (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-2xl border border-black/20 dark:border-white/20 bg-white300 dark:bg-black400">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 md:w-18 h-12 md:h-18 rounded-sm bg-slate200 dark:bg-white200 shrink-0 bg-cover bg-center"
                    style={image ? { backgroundImage: `url(${image})` } : undefined}
                  ></div>
                  <div className="flex flex-col gap-3 font-inter">
                    <div className="flex flex-col gap-1">
                      <h5 className="text-sm md:text-base font-bold text-black dark:text-white">{product?.name}</h5>
                      <p className="text-sm md:text-base font-bold text-black dark:text-white">{formatPrice(product?.priceAmount, product?.currency)}</p>
                    </div>
                    <span className="text-[10px] text-slate700">{totalSold} sold</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 md:gap-3.5">
                  <div className={`text-[10px] md:text-sm font-semibold font-inter px-0.5 md:px-1.5 py-1 rounded ${
                    isSoldOut ? 'bg-green300/10 dark:bg-green200 text-green300' : 'bg-red700/10 text-red700'
                  }`}> {isSoldOut ? 'Sold Out' : 'In Stock'}</div>

                  <button><FaEllipsisVertical/></button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ProductSection;
