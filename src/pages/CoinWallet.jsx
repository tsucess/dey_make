import CoinTabSection from "../components/CoinsWallet/CoinTabSection";
import HeroSection from "../components/CoinsWallet/HeroSection";

function CoinWallet() {
  return (
    <section className="flex flex-col gap-10 px-6 pb-10">
      <HeroSection />
      <CoinTabSection />
    </section>
  );
}

export default CoinWallet;
