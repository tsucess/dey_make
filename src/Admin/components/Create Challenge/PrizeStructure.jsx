import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";

const initialPrize = {
  id: Date.now(),
  title: "1st Prize",
  description: "Top performer",
  reward: "Cash",
  amount: "500000",
};

export default function PrizeStructure() {
  const [prizes, setPrizes] = useState([initialPrize]);

  const addPrize = () => {
    setPrizes((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: `${prev.length + 1}${getSuffix(prev.length + 1)} Prize`,
        description: "",
        reward: "Cash",
        amount: "",
      },
    ]);
  };

  const removePrize = (id) => {
    setPrizes((prev) => prev.filter((item) => item.id !== id));
  };

  const updatePrize = (id, field, value) => {
    setPrizes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  return (
    <div className=" flex flex-col gap-6">
      <h2 className="text-white text-lg">Prize Structure</h2>

      <div className="space-y-5">
        {prizes.map((prize, index) => (
          <div
            key={prize.id}
            className="bg-blue500 rounded-2xl p-4 flex items-center gap-5"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 shrink-0 rounded-full bg-orange100 flex items-center justify-center text-black text-2xl">
                🏅
              </div>

              <div className="space-y-1">
                <input
                  value={prize.title}
                  onChange={(e) =>
                    updatePrize(prize.id, "title", e.target.value)
                  }
                  className="bg-transparent text-white text-xs outline-none"
                />

                <input
                  value={prize.description}
                  onChange={(e) =>
                    updatePrize(prize.id, "description", e.target.value)
                  }
                  className="bg-transparent text-gray-400 text-xs outline-none"
                  placeholder="Description"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-white text-xs">Reward</label>

              <select
                value={prize.reward}
                onChange={(e) =>
                  updatePrize(prize.id, "reward", e.target.value)
                }
                className="border rounded-md px-1 py-1 bg-transparent text-white text-xs"
              >
                <option className="text-white">Cash</option>
                <option className="text-white">Gift</option>
                <option className="text-white">Voucher</option>
                <option className="text-white">Medal</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-white text-xs">Amount</label>

              <select
                value={prize.amount}
                onChange={(e) =>
                  updatePrize(prize.id, "amount", e.target.value)
                }
                className="border rounded-md px-2 py-1 text-xs bg-transparent text-white"
              >
                <option className="text-white">100000</option>
                <option className="text-white">250000</option>
                <option className="text-white">500000</option>
                <option className="text-white">1000000</option>
              </select>
            </div>

            {prizes.length > 1 && (
              <button
                onClick={() => removePrize(prize.id)}
                className="w-10 h-10 rounded-xl border border-gray-600 flex shrink-0 items-center justify-center hover:bg-red100 text-white"
              >
                <FaTrashCan className="w-4 h-4 " />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addPrize}
        className="w-full border border-orange100 rounded-lg py-3 text-orange100 text-base hover:bg-orange100 hover:text-black transition"
      >
        Add Another Prize
      </button>
    </div>
  );
}

function getSuffix(number) {
  if (number === 1) return "st";
  if (number === 2) return "nd";
  if (number === 3) return "rd";
  return "th";
}
