/**
 * CoinWallet page — fan/creator wallet screen.
 *
 * Shows balance, transaction ledger, and payout controls. Data comes
 * from api.getMonetizationSummary and api.getWalletTransactions.
 *
 * Feature: 3.12 Tips & wallet (see PROJECT_OVERVIEW.md).
 * Backend: MonetizationController.
 */

import CoinTabSection from "../components/CoinsWallet/CoinTabSection";
import HeroSection from "../components/CoinsWallet/HeroSection";

function CoinWallet() {
  return (
    <section className="flex flex-col gap-6 md:gap-10 px-4 md:px-6 pb-10">
      <HeroSection />
      <CoinTabSection />
    </section>
  );
}

export default CoinWallet;
