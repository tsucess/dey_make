import { GiRose, GiInterstellarPath, GiSpaceShuttle } from "react-icons/gi";

const giftReceived = [
  { icon: GiRose, name: "Rose", amount: 1, quantity: 438 },
  { icon: GiSpaceShuttle, name: "Galaxy", amount: 1, quantity: 12 },
  { icon: GiInterstellarPath, name: "Interstellar", amount: 1, quantity: 12 },
  { icon: GiRose, name: "Crown", amount: 1, quantity: 12 },
];

function GiftReceived() {
  return (
    <div className="border border-black/30 dark:border-white/30 p-5 rounded-3xl flex flex-col gap-6 font-inter">
      <h3 className="text-black dark:text-white font-bold text-xl">
        Top Gifts Received
      </h3>
      <div className="flex flex-col gap-6">
        {giftReceived.map(({ icon: Icon, name, amount, quantity }, i) => (
          <div key={name - i} className="flex items-center gap-3">
            <div
              className={`w-10 h-10 border flex items-center justify-center rounded-md ${
                name === "Rose"
                  ? "border-red700 bg-red700/10 text-red700"
                  : name === "Galaxy"
                    ? "border-blue bg-blue/10 text-blue"
                    : name === "Interstellar"
                      ? "border-orange100 bg-orange10010 text-orange100"
                      : name === "Crown"
                        ? "border-orange500 bg-orange500/10 text-orange500"
                        : ""
              }`}
            >
              {" "}
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-1.5">
                <h5 className="text-base font-bold text-black dark:text-white">
                  {name}
                </h5>
                <span className="text-xs font-bold text-slate50 dark:text-slate250">
                  {amount} coins
                </span>
              </div>
              <div className="flex items-center gap-10">
                <div className="flex-1 h-2 bg-slate150 dark:bg-slate500 flex">
                  <div
                    className={`h-full ${i === 0 ? "w-[80%]" : "w-1/2"} ${
                      name === "Rose"
                        ? "bg-red700 "
                        : name === "Galaxy"
                          ? "bg-blue"
                          : name === "Interstellar"
                            ? "bg-orange100"
                            : name === "Crown"
                              ? "bg-orange500"
                              : ""
                    }`}
                  ></div>
                </div>
                <span className="text-[11px] text-black/80 dark:text-white/80">
                  {quantity}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GiftReceived;
