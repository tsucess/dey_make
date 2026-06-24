import { FaEllipsisVertical } from "react-icons/fa6";

const products = [
    {name: 'Makemation Hoodie', value:'$9,702' , totalSold: 100, isSoldOut: false},
    {name: 'Creator Cap', value:'$9,702' , totalSold: 200, isSoldOut: false},
    {name: 'Makemation Tote Bag', value:'$9,702' , totalSold: 50, isSoldOut: true},
]

function ProductSection() {
  return (
    <div className="flex flex-col gap-6 border border-black/20 dark:border-white/20 rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold text-black dark:text-white">Products</h3>
        <button className="bg-orange100 text-black text-xs font-bold rounded-lg py-3 px-8">Add Product</button>
      </div>

      <div className="flex flex-col gap-5 ">
        {
            products.map(({name, value, totalSold, isSoldOut }, i) => <div key={name-i} className="flex items-center justify-between p-3 rounded-2xl border border-black/20 dark:border-white/20 bg-white300 dark:bg-black400">
                <div className="flex items-center gap-3">
                    <div className="w-18 h-18 rounded-sm bg-slate200 dark:bg-white200"></div>
                    <div className="flex flex-col gap-3 font-inter">
                        <div className="flex flex-col gap-1">
                            <h5 className="text-base font-bold text-black dark:text-white">{name}</h5>
                            <p className="text-base font-bold text-black dark:text-white">{value}</p>
                        </div>
                        <span className="text-[10px] text-slate700">{totalSold} sold</span>
                    </div>
                </div>
                <div className="flex items-center gap-3.5">
                    <div className={`text-sm font-semibold font-inter px-1.5 py-1 rounded ${
                        isSoldOut ? 'bg-green300/10 dark:bg-green200 text-green300' : 'bg-red700/10 text-red700'
                    }`}> {isSoldOut ? 'Sold Out' : 'In Stock'}</div>

                    <button><FaEllipsisVertical/></button>
                </div>
            </div>)
        }
      </div>
    </div>
  );
}

export default ProductSection;
