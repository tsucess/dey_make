import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import CreativesSection from "../components/landing/CreativesSection";
import WhySection from "../components/landing/WhySection";
import WaitlistForm from "../components/landing/WaitlistForm";
import CreativesBanner from "../components/landing/CreativesBanner";
import FAQSection from "../components/landing/FAQSection";
import LandingFooter from "../components/landing/LandingFooter";

export default function LandingPage({ onSignUp }) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <LandingNavbar onSignUp={onSignUp} />
      <HeroSection onSignUp={onSignUp} />
      <CreativesSection />
      <WhySection />
      <WaitlistForm />
      <CreativesBanner onSignUp={onSignUp} />
      <FAQSection />
      <LandingFooter onSignUp={onSignUp} />
    </div>
  );
}