import GiftReceived from "./GiftReceived";
import GiftSection from "./GiftSection";
import GiftSent from "./GiftSent";

function GiftTab() {
  return (
    <div className="flex flex-col gap-8">
      <GiftSection />
      <GiftReceived />
      <GiftSent/>
    </div>
  );
}

export default GiftTab;
